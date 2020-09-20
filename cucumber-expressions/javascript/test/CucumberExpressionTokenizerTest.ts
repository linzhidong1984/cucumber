import fs from 'fs'
// eslint-disable-next-line node/no-extraneous-import
import yaml from 'js-yaml' // why?
import CucumberExpressionTokenizer from '../src/CucumberExpressionTokenizer'
import assert from 'assert'

interface Expectation {
  expression: string
  expected?: string
  exception?: string
}

describe('Cucumber expression tokenizer', () => {
  fs.readdirSync('testdata/tokens').forEach((testcase) => {
    const testCaseData = fs.readFileSync(`testdata/tokens/${testcase}`, 'utf-8')
    const expectation = yaml.safeLoad(testCaseData) as Expectation
    it(`${testcase}`, () => {
      const tokenizer = new CucumberExpressionTokenizer()
      if (expectation.exception == undefined) {
        const tokens = tokenizer.tokenize(expectation.expression)
        assert.deepStrictEqual(tokens, JSON.parse(expectation.expected))
      } else {
        assert.throws(() => {
          tokenizer.tokenize(expectation.expression)
        }, expectation.exception)
      }
    })
  })
})