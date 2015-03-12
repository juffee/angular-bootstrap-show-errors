(function() {
  var showErrorsModule;

  showErrorsModule = angular.module('ui.bootstrap.showErrors', []);

  showErrorsModule.directive('showErrors', [
    '$timeout', 'showErrorsConfig', '$interpolate','$compile', function($timeout, showErrorsConfig, $interpolate, $compile) {
      var getShowSuccess, getShowTooltip, getTrigger, linkFn, changeTooltipMsg;
      getTrigger = function(options) {
        var trigger;
        trigger = showErrorsConfig.trigger;
        if (options && (options.trigger != null)) {
          trigger = options.trigger;
        }
        return trigger;
      };
      getShowSuccess = function(options) {
        var showSuccess;
        showSuccess = showErrorsConfig.showSuccess;
        if (options && (options.showSuccess != null)) {
          showSuccess = options.showSuccess;
        }
        return showSuccess;
      };
      getShowTooltip = function(options) {
        var showTooltip;
        showTooltip = showErrorsConfig.showTooltip;        
        if (options && (options.showTooltip != null)) {
          showTooltip = options.showTooltip;
        }

        return showTooltip;
      };
      getValidationMessages = function(options){        
        var validationMessages 
        validationMessages = showErrorsConfig.validationMessages;
        if(options && (options.validationMessages != null)) {
          validationMessages = _.assign(options.validationMessages,validationMessages);
        }        
        return validationMessages;
      };
      getTooltipMsg = function(errors, validationMessages){
        //TODO: How do you remove validationMessages in the parameter? Or do you have to?
        var msg = "";
        for (var prop in errors) {          
          if(errors[prop] == true){
            msg = msg + validationMessages[prop];
          }
        }        
        return msg;
      };
      linkFn = function(scope, el, attrs, formCtrl) {
        var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses, trigger, showTooltip, validationMessages;
        blurred = false;
        options = scope.$eval(attrs.showErrors);
        showSuccess = getShowSuccess(options);
        showTooltip = getShowTooltip(options);
        validationMessages = getValidationMessages(options);
        
        trigger = getTrigger(options);
        inputEl = el[0].querySelector('.form-control[name]');
        inputNgEl = angular.element(inputEl);
        inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

        if (!inputName) {
          throw "show-errors element has no child input elements with a 'name' attribute and a 'form-control' class";
        }
        inputNgEl.bind(trigger, function() {
          blurred = true;
          return toggleClasses(formCtrl[inputName].$invalid);
        });
        scope.$watch(function() {
          return formCtrl[inputName] && formCtrl[inputName].$invalid;
        }, function(invalid) {
          if (!blurred) {
            return;
          }
          return toggleClasses(invalid);
        });
        scope.$on('show-errors-check-validity', function() {
          return toggleClasses(formCtrl[inputName].$invalid);
        });
        scope.$on('show-errors-reset', function() {
          return $timeout(function() {
            el.removeClass('has-error');
            el.removeClass('has-success');
            return blurred = false;
          }, 0, false);
        });

        /** 
          * If no showTooltip option is present show tooltip
          * attr tooltip will be added to the field with the value of the validation message stored in each form field
          */        
        if(attrs['showErrors'].indexOf('showTooltip') === -1){            
          inputNgEl.attr('tooltip','{{'+formCtrl.$name +'.'+ inputName +'.validationMessage}}');          
        }
        // References: http://stackoverflow.com/questions/19224028/add-directives-from-directive-in-angularjs        
        $compile(el,null,1000)(scope);

        return toggleClasses = function(invalid) {          
          el.toggleClass('has-error', invalid);
          if (showSuccess) {
            return el.toggleClass('has-success', !invalid);
          }
          if(showTooltip){                        
            var msg = getTooltipMsg( formCtrl[inputName].$error, validationMessages );          
            formCtrl[inputName].validationMessage = $interpolate(msg || '')(scope);
          }           
        };
      };
      return {
        restrict: 'A',        
        require: '^form',
        terminal: true,
        priority: 1000,
        compile: function(elem, attrs) {
          var inputEl = elem[0].querySelector('.form-control[name]'),
              inputNgEl = angular.element(inputEl);
          
          if (attrs['showErrors'].indexOf('skipFormGroupCheck') === -1) {
            if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
              throw "show-errors element does not have the 'form-group' or 'input-group' class";
            }
          }
          return linkFn;
        }
      };
    }
  ]);

  showErrorsModule.provider('showErrorsConfig', function() {
    var _showSuccess, _showTooltip, _trigger;
    _showSuccess = false;
    _showTooltip = true;
    _trigger = 'blur';
    _validationMessages = {
      'required': 'Required. ',
      'pattern': 'Invalid. ',
      'email': 'Invalid Email. ',
      'max': 'Too large. ',
      'min': 'Too small. ',
      'maxlength': 'Too long. ',
      'minlength': 'Too short. ',
      'unique': "Sorry this must be unique, duplicate found. ",
      'mongoose': 'Hmm. Something went wrong :( '
    }
    this.showSuccess = function(showSuccess) {
      return _showSuccess = showSuccess;
    };
    this.showTooltip = function(showTooltip) {
      return _showTooltip = showTooltip;
    }
    this.validationMessages = function(validationMessages) {
      return _.assign(_validationMessages, validationMessages);
    }
    this.trigger = function(trigger) {
      return _trigger = trigger;
    };
    this.$get = function() {
      return {
        showSuccess: _showSuccess,
        showTooltip: _showTooltip,
        trigger: _trigger,
        validationMessages: _validationMessages
      };
    };    
  });

}).call(this);
