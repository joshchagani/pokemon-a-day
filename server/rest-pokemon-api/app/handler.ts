import {
  Handler,
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { interpret } from "xstate";
import { apiMachine } from "./machine";
import { IPokemon } from "../../model/pokemon";
import { invokeTodaysEpoch } from "../../utils";
import env from "../../utils/envConfig";

export const getPokemon: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log("🚧 event", event);
  const id = event?.queryStringParameters?.id;
  if (!idChecker(id))
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "https://todayspokemon.com",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          message: "No Pokémon for you!",
        },
        null,
        2
      ),
    };
  await env();
  return await setupMachine(parseInt(id));
};

async function setupMachine(id: number): Promise<APIGatewayProxyResult> {
  const dateEpochUTC = invokeTodaysEpoch(id);
  const initialContext: IPokemon = { dateEpochUTC };
  return new Promise((resolve) => {
    let pokemonInfo = {};
    const apiMachineWithContext = apiMachine.withContext({
      pokemonInfo: initialContext,
    });
    const databaseService = interpret(apiMachineWithContext);
    databaseService.subscribe((state) => {
      console.log("🌏 state", state.value);
      if (state.value === "success") {
        const {
          currentTotalPokemon,
          pokemonAbilities,
          pokemonBaseExp,
          pokemonColor,
          pokemonGameAppearances,
          pokemonHeight,
          pokemonId,
          pokemonName,
          pokemonSpriteUrl,
          pokemonTypes,
          pokemonWeight,
        } = state.context.pokemonInfo as IPokemon;

        pokemonInfo = {
          currentTotalPokemon,
          pokemonAbilities,
          pokemonBaseExp,
          pokemonColor,
          pokemonGameAppearances,
          pokemonHeight,
          pokemonId,
          pokemonName,
          pokemonSpriteUrl,
          pokemonTypes,
          pokemonWeight,
        };
      }
    });
    databaseService.start();
    databaseService.onDone(() =>
      resolve({
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "https://todayspokemon.com",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            message: "Pokemon goods",
            data: pokemonInfo,
          },
          null,
          2
        ),
      })
    );
  });
}

function idChecker(id: string): boolean {
  if (!id || id === "" || id.length < 10) return false;
  return true;
}
