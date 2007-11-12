@module Testing
@version 0.5.0 (12-Nov-2007)
@target JavaScript
| The testing module implements a simple stateful test engine that allows to
| quickly setup and run tests.
|
| NOTE _________________________________________________________________________
| This engine is designed to be used mainly with the JavaScript backend, and was
| written so that it does not depend on the sugar runtime libraries.

@shared TestCount:Integer  = 0
@shared CaseCount:Integer  = 0
@shared CurrentTest:String = Undefined
@shared Results:List       = []

@shared Callbacks = {
	OnCaseStart : Undefined
	OnCaseEnd   : Undefined
	OnTestStart : Undefined
	OnTestEnd   : Undefined
	OnFailure   : Undefined
	OnSuccess   : Undefined
}

# ------------------------------------------------------------------------------
# CREATING A NEW TEST CASE
# ------------------------------------------------------------------------------

@function testCase:Integer name
| Creates a new test case with the given name, and returns the identifier of the
| test case.
	var case_id = CaseCount
	if CaseCount > 0 -> endCase (case_id - 1)
	if Callbacks OnCaseStart -> Callbacks OnCaseStart (case_id, name)
	CurrentCase = name
@end

@function endCase:Integer caseID
| Notifies the end of the give test case
	# TODO: Give name and time for case ending
	if Callbacks OnCaseEnd -> Callbacks OnCaseEnd (caseID)
@end

# ------------------------------------------------------------------------------
# CREATING A NEW TEST
# ------------------------------------------------------------------------------

@function test:Integer name
| Notifies that a new test has begun. The given 'name' will be the
| test description. This returns an identifier (as an int) that will allow to
| access the test.
|
| If there is a previous test, and it was not ended, this will also end the
| previous test.
	var test_id = TestCount
	# We trigger the callbacks first so that we do not have problems with timing
	# by introduce the callback execution time
	if TestCount > 0 -> end(test_id - 1)
	if Callbacks OnTestStart -> Callbacks OnTestStart(test_id, name)
	CurrentTest = name
	Results push {
		tid    : test_id
		cid    : CaseCount
		status : "S"
		name   : name
		start  : (new Date() getMilliseconds())
		tests  : []
	}
	TestCount  += 1
	return test_id
@end

# ------------------------------------------------------------------------------
# ENDING A TEST
# ------------------------------------------------------------------------------

@function end testID
| Ends the test with the given 'testID' (or the last test if no ID was given).
| Note that a test can only be ended once.
	if testID is Undefined -> testID = TestCount - 1
	var test = Results[testID] 
	if test ended -> return True
	test end   = new Date() getMilliseconds()
	test run   = (test end) - (test start)
	test ended = True
	if Callbacks OnTestEnd -> Callbacks OnTestEnd(testID, test)
@end

# ------------------------------------------------------------------------------
# FAILING THE CURRENT TEST
# ------------------------------------------------------------------------------

@function fail reason
| Fails the current test with the given reason
	# console log (" failure: " + reason)
	var test_id = TestCount - 1
	Results[ test_id ] tests push {result:"F", reason:reason}
	Results[ test_id ] status = "F"
	# TODO: Remove callback execution time
	if Callbacks OnFailure -> Callbacks OnFailure(test_id, Results[test_id] tests length - 1, reason)
	return False
@end

# ------------------------------------------------------------------------------
# SUCCEEDING THE CURRENT TEST
# ------------------------------------------------------------------------------

@function succeed
| Success the current test
	#console log (" success !")
	var test_id = TestCount - 1
	Results[ test_id ] tests push {result:"S"}
	# TODO: Remove callback execution time
	if Callbacks OnSuccess -> Callbacks OnSuccess(test_id, Results[test_id] tests length - 1)
	return True
@end

# ------------------------------------------------------------------------------
# PREDICATES
# ------------------------------------------------------------------------------

@function asTrue val
| Alias for 'value(val, True)'
	return value (val, True)
@end

@function asFalse val
| Alias for 'value(val, False)'
	return value (val, False)
@end

@function asUndefined val
| Alias for 'value(val==Undefined, True)'
	return value (val == Undefined, True)
@end

@function asDefined val
| Alias for 'value(val==Undefined, False)'
	return value (val == Undefined, False)
@end

@function unlike value, other
| Unsures that the given 'value' is different from the 'other' value
	if value == other
		fail ("Values are expected to be different '" + value + "' vs '" + other + "'")
	else
		succeed()
	end
@end

@function value value, expected
| Succeeds if the given value is non-null or if the given value equals the other
| expected value.
	if expected != Undefined
		if value != expected
			return fail ("Expected value to be '" + expected + "', got '" + value + "'")
		else
			return succeed()
		end
	else
		if value is Undefined
			return fail "Value expected to be defined"
		if not value
			return fail "Value expected to be non-null"
		else
			return succeed()
		end
	end
@end

# FIXME: Add this
# @shared PREDICATES {
#	asTrue      : asTrue
#	asFalse     : asFalse
#	asUndefined : asUndefined
#	asDefined   : asDefined
#	unlike      : unlike
#	value       : value
#}

@specific OOP

	@class TestCase

		@property name
		@property tests = []

		@constructor name = (self getClass() getName())
			self name = name
		@end

		@method add tests...
		@end

		@method run
			testCase (name)
			tests :: {t| t run() }
			endCase ()
		@end

	@end

	@class UnitTest

		@shared   ensure = testing
		@property name

		@constructor name = (self getClass() getName())
			self name = name
		@end

		@method run
			self getClass() listMethods() :: {m,n|
				if n indexOf "test" == 0
					runTest (m,n)
				end
			}
		@end

		@method runTest testFunction, name
			test (name)
			testFunction()
			end ()
		@end

	@end

@end

# EOF
