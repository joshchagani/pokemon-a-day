import * as React from 'react'
import { render } from '@testing-library/react'
import { expect } from 'chai'
import App from './App'

describe('<App>', () => {
  it('renders <main>', () => {
    render(<App />)
    const mainTag = document.querySelector('main')
    expect(mainTag?.tagName.toLocaleLowerCase()).to.equal('main')
  })
})
