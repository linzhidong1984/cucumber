import assert from 'assert'
import { messages } from 'cucumber-messages'
import TestStep from '../src/TestStep'
import {
  stubFailingSupportCodeExecutor,
  stubMatchingStepDefinition,
  stubPassingSupportCodeExecutor,
  stubPendingSupportCodeExecutor,
} from './TestHelpers'
import makePickleTestStep from '../src/makePickleTestStep'
import SupportCodeExecutor from '../src/SupportCodeExecutor'

function execute(testStep: TestStep): messages.ITestStepFinished {
  const receivedMessages: messages.IEnvelope[] = []
  testStep.execute(
    message => receivedMessages.push(message),
    'some-testCaseStartedId'
  )
  return receivedMessages.pop().testStepFinished
}

describe('TestStep', () => {
  describe('#execute', () => {
    it('emits a TestStepFinished with status UNDEFINED when there are no matching step definitions', () => {
      const testStep = makePickleTestStep(
        messages.Pickle.PickleStep.create({
          text: 'an undefined step',
        }),
        []
      )

      const testStepFinished = execute(testStep)

      assert.strictEqual(
        testStepFinished.testResult.status,
        messages.TestResult.Status.UNDEFINED
      )
      assert.strictEqual(testStepFinished.testStepId, testStep.id)
    })

    it('emits a TestStepFinished with status AMBIGUOUS when there are multiple matching step definitions', () => {
      const testStep = makePickleTestStep(
        messages.Pickle.PickleStep.create({
          text: 'an undefined step',
        }),
        [stubMatchingStepDefinition(), stubMatchingStepDefinition()]
      )

      const testStepFinished = execute(testStep)
      assert.strictEqual(
        testStepFinished.testResult.status,
        messages.TestResult.Status.AMBIGUOUS
      )
      assert.strictEqual(testStepFinished.testStepId, testStep.id)
    })

    it('returns the status', () => {
      const testStep = makePickleTestStep(
        messages.Pickle.PickleStep.create({
          text: 'an undefined step',
        }),
        []
      )

      assert.strictEqual(
        testStep.execute(message => null, 'some-testCaseStartedId'),
        messages.TestResult.Status.UNDEFINED
      )
    })

    context('when there is a matching step definition', () => {
      it('emits a TestStepFinished with status PASSED when no exception is raised', () => {
        const testStep = makePickleTestStep(
          messages.Pickle.PickleStep.create({
            text: 'a passed step',
          }),
          [stubMatchingStepDefinition(stubPassingSupportCodeExecutor())]
        )

        const testStepFinished = execute(testStep)

        assert.strictEqual(
          testStepFinished.testResult.status,
          messages.TestResult.Status.PASSED
        )
        assert.strictEqual(testStepFinished.testStepId, testStep.id)
      })

      it('emits a TestStepFinished with status PENDING when the string "pending" is returned', () => {
        const testStep = makePickleTestStep(
          messages.Pickle.PickleStep.create({
            text: 'a passed step',
          }),
          [stubMatchingStepDefinition(stubPendingSupportCodeExecutor())]
        )
        const testStepFinished = execute(testStep)

        assert.strictEqual(
          testStepFinished.testResult.status,
          messages.TestResult.Status.PENDING
        )
        assert.strictEqual(testStepFinished.testStepId, testStep.id)
      })

      it('emits a TestStepFinished with status FAILED when an exception is raised', () => {
        const testStep = makePickleTestStep(
          messages.Pickle.PickleStep.create({
            text: 'a passed step',
          }),
          [
            stubMatchingStepDefinition(
              stubFailingSupportCodeExecutor('This step has failed')
            ),
          ]
        )

        const testStepFinished = execute(testStep)
        assert.strictEqual(
          testStepFinished.testResult.status,
          messages.TestResult.Status.FAILED
        )
        assert.strictEqual(testStepFinished.testStepId, testStep.id)
      })

      it('emits a TestStepFinished with error message from docstring', () => {
        const docString = new messages.PickleStepArgument.PickleDocString({
          content: 'hello',
        })
        const testStep = makePickleTestStep(
          messages.Pickle.PickleStep.create({
            text: 'a passed step',
            argument: new messages.PickleStepArgument({
              docString,
            }),
          }),
          [
            stubMatchingStepDefinition(
              new SupportCodeExecutor(
                'an-id',
                (docStringArg: string) => {
                  throw new Error(`error from ${docStringArg}`)
                },
                [],
                docString,
                null
              )
            ),
          ]
        )

        const testStepFinished = execute(testStep)
        assert.strictEqual(
          testStepFinished.testResult.message,
          'error from hello'
        )
        assert.strictEqual(testStepFinished.testStepId, testStep.id)
      })
    })
  })
})