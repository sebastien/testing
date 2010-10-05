// 8< ---[testing.js]---
// The testing module implements a simple stateful test engine that allows to
// quickly setup and run tests.
// 
// NOTE _________________________________________________________________________
// This engine is designed to be used mainly with the JavaScript backend, and was
// written so that it does not depend on the sugar runtime libraries.

var testing=testing||{}
var self=testing
testing.__VERSION__='0.6.1';
testing.TestCount=0
testing.CaseCount=0
testing.CurrentTest=undefined
testing.PredicateStack=[]
testing.Results=[]
testing.Callbacks={'OnCaseStart':undefined, 'OnCaseEnd':undefined, 'OnTestStart':undefined, 'OnTestEnd':undefined, 'OnFailure':undefined, 'OnSuccess':undefined, 'OnNote':undefined, 'OnLog':undefined}
testing.Options={'ExceptionOnFailure':false}
testing.option=	function(name, value){
		var self=testing;
		testing.Options[name] = value;
		return testing
	}
testing.enable=	function(option){
		var self=testing;
		testing.Options[option] = true;
		return testing
	}
testing.disable=	function(option){
		var self=testing;
		testing.Options[option] = false;
		return testing
	}
testing.testCase=	function(name){
		// Creates a new test case with the given name, and returns the identifier of the
		// test case.
		var self=testing;
		var case_id=testing.CaseCount;
		if ( (testing.CaseCount > 0) )
		{testing.endCase((case_id - 1))}
		if ( testing.Callbacks.OnCaseStart )
		{testing.Callbacks.OnCaseStart(case_id, name)}
		CurrentCase = name;
		return testing
	}
testing.endCase=	function(caseID){
		// Notifies the end of the give test case
		var self=testing;
		if ( testing.Callbacks.OnCaseEnd )
		{testing.Callbacks.OnCaseEnd(caseID)}
		return testing
	}
testing.test=	function(name){
		// Notifies that a new test has begun. The given 'name' will be the
		// test description. This returns an identifier (as an int) that will allow to
		// access the test.
		// 
		// If there is a previous test, and it was not ended, this will also end the
		// previous test.
		var self=testing;
		var test_id=testing.TestCount;
		if ( (testing.TestCount > 0) )
		{testing.end((test_id - 1))}
		if ( testing.Callbacks.OnTestStart )
		{testing.Callbacks.OnTestStart(test_id, name)}
		testing.CurrentTest = name;
		testing.Results.push({'tid':test_id, 'cid':testing.CaseCount, 'status':'S', 'name':name, 'start':new Date().getTime(), 'tests':[]})
		testing.TestCount = (testing.TestCount + 1);
		return testing
	}
testing.currentTest=	function(){
		var self=testing;
		return (testing.TestCount - 1)
	}
testing.end=	function(testID){
		// Ends the test with the given 'testID' (or the last test if no ID was given).
		// Note that a test can only be ended once.
		var self=testing;
		testID = testID === undefined ? undefined : testID
		if ( (testID === undefined) )
		{
			testID = (testing.TestCount - 1);
		}
		var test=testing.Results[testID];
		if ( test.ended )
		{
			return true
		}
		test.end = new Date().getTime();
		test.run = (test.end - test.start);
		test.ended = true;
		if ( testing.Callbacks.OnTestEnd )
		{testing.Callbacks.OnTestEnd(testID, test)}
		return testing
	}
testing.fail=	function(reason){
		// Fails the current test with the given reason
		var self=testing;
		if ( (testing.PredicateStack.length == 0) )
		{
			var test_id=(testing.TestCount - 1);
			testing.Results[test_id].tests.push({'result':'F', 'reason':reason})
			testing.Results[test_id].status = 'F';
			if ( testing.Callbacks.OnFailure )
			{testing.Callbacks.OnFailure(test_id, (testing.Results[test_id].tests.length - 1), reason)}
			if ( testing.Options.ExceptionOnFailure )
			{
				testing.note('Test interrupted by exception (see Options ExceptionOnFailure)')
				throw reason
			}
			return false
		}
		else if ( true )
		{
			return reason
		}
	}
testing.succeed=	function(){
		// Success the current test
		var self=testing;
		if ( (testing.PredicateStack.length == 0) )
		{
			var test_id=(testing.TestCount - 1);
			testing.Results[test_id].tests.push({'result':'S'})
			if ( testing.Callbacks.OnSuccess )
			{testing.Callbacks.OnSuccess(test_id, (testing.Results[test_id].tests.length - 1))}
		}
		return true
	}
testing.note=	function(message){
		var self=testing;
		if ( testing.Callbacks.OnNote )
		{testing.Callbacks.OnNote(message)}
	}
testing.log=	function(arguments){
		var self=testing;
		arguments = extend.sliceArguments(arguments,0)
		if ( testing.Callbacks.OnLog )
		{testing.Callbacks.OnLog(arguments.join(' '))}
	}
testing.run=	function(callback){
		// Runs the given callback function in a 'try...' catch clause. Exceptions
		// will be absorbed and not propagated back in the containing code.
		// 
		// Ex: 'testing run { ... }'
		var self=testing;
		try {
			callback()
		}
		catch(e){
			extend.fail(('Test failed with exception: ' + e))
		}
		return testing
	}
testing.expectException=	function(callback){
		// Expects an exception being raised when executing the given callback
		// 
		// Ex: 'testing expectException { ... }'
		var self=testing;
		try {
			callback()
			extend.fail()
		}
		catch(e){
			testing.succeed()
		}
		return testing
	}
testing.expectFailure=	function(callback, args){
		var self=testing;
		args = extend.sliceArguments(arguments,1)
		testing.PredicateStack.push(testing.expectFailure)
		var result=callback.apply(self, args);
		testing.PredicateStack.pop()
		if ( (result === true) )
		{
			return extend.fail('A failure was expected')
		}
		else if ( true )
		{
			return testing.succeed()
		}
	}
testing.PREDICATES={'ensure':testing.ensure, 'asTrue':testing.asTrue, 'asFalse':testing.asFalse, 'asUndefined':testing.asUndefined, 'asDefined':testing.asDefined, 'asDefined':testing.asDefined, 'asUndefined':testing.asUndefined, 'unlike':testing.unlike, 'same':testing.same, 'value':testing.value}
testing.ensure=	function(val){
		// Really just an alias for 'asTrue'
		var self=testing;
		return testing.asTrue(val)
	}
testing.asTrue=	function(val){
		// Alias for 'value(val, True)'
		var self=testing;
		return testing.value(val, true)
	}
testing.asFalse=	function(val){
		// Alias for 'value(val, False)'
		var self=testing;
		return testing.value(val, false)
	}
testing.asUndefined=	function(val){
		// Alias for 'value(val==Undefined, True)'
		var self=testing;
		return testing.value((val === undefined), true)
	}
testing.asDefined=	function(val){
		// Alias for 'value(val==Undefined, False)'
		var self=testing;
		return testing.value((val === undefined), false)
	}
testing.unlike=	function(value, other){
		// Unsures that the given 'value' is different from the 'other' value
		var self=testing;
		if ( (value == other) )
		{
			extend.fail((((("Values are expected to be different '" + value) + "' vs '") + other) + "'"))
		}
		else if ( true )
		{
			testing.succeed()
		}
	}
testing.same=	function(val, expected){
		// Same is a better version of 'value' that will introspect dictionaries and
		// lists to check that the keys and items are the same.
		var self=testing;
		var result=true;
		testing.PredicateStack.push(testing.same)
		if ( Extend.isList(expected) )
		{
			if ( Extend.isList(val) )
			{
				extend.iterate(expected, function(v, i){
					if ( ((i >= val.length) || (testing.same(val[i], v) != true)) )
					{
						result = false;
					}
				}, self)
				if ( (result != true) )
				{
					result = 'The lists are different';
				}
			}
			else if ( true )
			{
				result = 'A list is expected';
			}
		}
		else if ( Extend.isMap(expected) )
		{
			if ( Extend.isMap(val) )
			{
				extend.iterate(expected, function(v, i){
					if ( (testing.same(val[i], v) != true) )
					{
						result = false;
					}
				}, self)
			}
			else if ( (! result) )
			{
				result = 'The maps are different';
			}
			else if ( true )
			{
				result = 'A map was expected';
			}
		}
		else if ( true )
		{
			result = testing.value(val, expected);
		}
		testing.PredicateStack.pop()
		if ( (result === true) )
		{
			return testing.succeed()
		}
		else if ( true )
		{
			return extend.fail(result)
		}
	}
testing.value=	function(value, expected){
		// Succeeds if the given value is non-null or if the given value equals the other
		// expected value.
		var self=testing;
		if ( (expected != undefined) )
		{
			if ( (value != expected) )
			{
				return extend.fail((((("Expected value to be '" + expected) + "', got '") + value) + "'"))
			}
			else if ( true )
			{
				return testing.succeed()
			}
		}
		else if ( true )
		{
			if ( (value === expected) )
			{
				return testing.succeed()
			}
			else if ( (value === undefined) )
			{
				return extend.fail('Value expected to be defined')
			}
			else if ( (! value) )
			{
				return extend.fail('Value expected to be non-null')
			}
			else if ( true )
			{
				return testing.succeed()
			}
		}
	}
testing._getPredicateCaller=	function(level){
		var self=testing;
		level = level === undefined ? 2 : level
		var called_function=getCaller;
		while ((level > 0))
		{
			called_function = called_function.caller;
			level = (level - 1);
		}
		return called_function
	}
testing.TestCase=extend.Class({
	// A test case is a collection of tests units
	name:'testing.TestCase', parent:undefined,
	properties:{
		name:undefined,
		tests:undefined
	},
	// Creates a test case with the given name (which is the class name by
	// default).
	initialize:function(name){
		var self=this
		name = name === undefined ? self.getClass().getName() : name
		if (typeof(self.tests)=='undefined') {self.tests = []};
		self.name = name;
	},
	methods:{
		// Adds the given tests to this test case tests list
		add:function(tests){
			var self=this
			tests = extend.sliceArguments(arguments,0)
			extend.iterate(tests, function(t){
				self.tests.push(t)
			}, self)
		},
		// Run all the tests registered in this test case.
		run:function(){
			var self=this
			testing.testCase(self.name)
			extend.iterate(self.tests, function(t){
				t.run()
			}, self)
			testing.endCase()
		}
	}
})
testing.TestUnit=extend.Class({
	// A test unit is a collection of individual tests exercising one or a
	// set of strongly related components.
	name:'testing.TestUnit', parent:undefined,
	shared:{
		ensure:testing
	},
	properties:{
		name:undefined
	},
	initialize:function(name){
		var self=this
		name = name === undefined ? self.getClass().getName() : name
		self.name = name;
	},
	methods:{
		run:function(){
			var self=this
			extend.iterate(self.getClass().listMethods(), function(m, n){
				if ( (n.indexOf('test') == 0) )
				{
					self.runTest(m, n)
				}
			}, self)
		},
		runTest:function(testFunction, name){
			var self=this
			testing.test(name)
			testFunction()
			testing.end()
		}
	}
})
testing.HTMLReporter=extend.Class({
	name:'testing.HTMLReporter', parent:undefined,
	properties:{
		selector:undefined,
		selector_table:undefined,
		callbacks:undefined
	},
	initialize:function(selector){
		var self=this
		selector = selector === undefined ? '#results' : selector
		self.selector = selector;
		self.ensureUI()
		self.callbacks = {'OnCaseStart':self.getMethod('onCaseStart') , 'OnCaseEnd':self.getMethod('onCaseEnd') , 'OnTestStart':self.getMethod('onTestStart') , 'OnTestEnd':self.getMethod('onTestEnd') , 'OnSuccess':self.getMethod('onSuccess') , 'OnFailure':self.getMethod('onFailure') , 'OnNote':self.getMethod('onNote') , 'OnLog':self.getMethod('onLog') };
	},
	methods:{
		// Ensures that there is the proper HTML node in the document to add the
		// results, otherwise creates it.
		ensureUI:function(){
			var self=this
			if ( ($(self.selector).length == 0) )
			{
				$('body').append("<div id='results'>  </div>")
			}
			self.selector = $(self.selector);
			if ( ($('table', self.selector).length == 0) )
			{
				$(self.selector).append(html.table())
			}
			self.selector_table = $('table', self.selector);
			$(self.selector).addClass('TestResults')
			$(self.selector_table).attr({'cellpadding':'0', 'cellspacing':'0'})
		},
		onCaseStart:function(){
			var self=this
		},
		onCaseEnd:function(){
			var self=this
		},
		onNote:function(message){
			var self=this
			console.log(('NOTE:' + message))
			var test_row=$(('#test_' + testing.currentTest()));
			$('.notes', test_row).append(html.li(message)).removeClass('empty')
		},
		onLog:function(message){
			var self=this
			var test_row=$(('#test_' + testing.currentTest()));
			var text=(($('.log pre', test_row).text() + message) + '\n');
			$('.log pre', test_row).text(text).removeClass('empty')
		},
		onTestStart:function(testID, testName){
			var self=this
			var test_row=html.tr({'id':('test_' + testID), 'class':'test test-running'}, html.td({'class':'test-id'}, ('#' + testID)), html.td({'class':'test-name'}, ('' + testName), html.div(html.ul({'class':'assertions empty'})), html.div(html.ul({'class':'notes empty'})), html.div({'class':'log empty'}, html.pre())), html.td({'class':'test-time'}, 'running...'));
			$(self.selector_table).append(test_row)
		},
		onTestEnd:function(testID, test){
			var self=this
			var test_row=$(('#test_' + testID));
			$(test_row).removeClass('test-running')
			if ( (test.status == 'S') )
			{
				$(test_row).addClass('test-succeeded')
			}
			else if ( true )
			{
				$(test_row).addClass('test-failed')
			}
			$('.test-time', test_row).html((test.run + 'ms'))
		},
		onSuccess:function(){
			var self=this
		},
		onFailure:function(testID, num, reason){
			var self=this
			$((('#test_' + testID) + ' .assertions')).removeClass('empty')
			$((('#test_' + testID) + ' .assertions')).append(html.li({'class':'assertion assertion-failed'}, ((('Assertion #' + num) + ' failed: ') + reason)))
		}
	},
	operations:{
		Install:function(){
			var self = this;
			var new_reporter=new testing.HTMLReporter();
			testing.Callbacks = new_reporter.callbacks;
			return new_reporter
		}
	}
})
testing.init=	function(){
		var self=testing;
	}
if (typeof(testing.init)!="undefined") {testing.init();}

