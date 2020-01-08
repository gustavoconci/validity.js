/**
 * validity - jQuery validation plugin (https://github.com/gustavoconci/validity.js)
 * Copyright (c) 2017-2018, Gustavo Henrique Conci. (MIT Licensed)
 */

(function() {
    var defaultSettings = {
            selector: ':input',
            ignore: ':hidden',
            showMessages: true
        },

        labelError = function(e, input, check) {
            var label = input.parentNode.querySelector('.error-message');

            if (label) {
                label.remove();
            }

            if (input.type == 'radio') {
                var inputs = document.querySelectorAll('[name="' + input.name + '"]'),
                    i = -1,
                    length = inputs.length;

                while (++i < length) {
                    var label = inputs[i].parentNode.querySelector('.error-message');
                    if (label) {
                        label.remove();
                    }
                }
            }

            if (check) {
                return;
            }

            if (['submit', 'focusout'].indexOf(e.type) >= 0) {
                var validity = input.validity;
                label = document.createElement('label');
                label.classList.add('error-message');

                if (input.type == 'radio') {
                    var inputs = document.querySelectorAll('[name="' + input.name + '"]');
                    input = inputs[0];
                }

                if (input.id) {
                    label.setAttribute('for', input.id);
                }

                var textMissing = input.getAttribute('data-missing');
                if (validity.valueMissing && textMissing) {
                    input.setCustomValidity(textMissing);
                }

                var textMismatch = input.getAttribute('data-mismatch')
                if ((validity.patternMismatch || validity.typeMismatch) && textMismatch) {
                    input.setCustomValidity(textMismatch);
                }

                labelText = document.createTextNode(input.validationMessage);
                label.appendChild(labelText);

                input.parentNode.insertBefore(label, input.nextSibling);
            }
        },

        inputCheck = function(e, input, settings) {
            var check = input.checkValidity();

            if (e.type === 'keyup' &&
                (!input.value || (['radio', 'checkbox'].indexOf(input.type) >= 0 && !input.checked))
            ) {
                return;
            }

            if (!check) {
                input.classList.add('error');
                input.classList.remove('valid');

                input.setCustomValidity('');
            } else {
                input.classList.add('valid');
                input.classList.remove('error');
            }

            if (settings.showMessages) {
                labelError(e, input, check);
            }

            return check;
        };

    $.fn.validity = function(settings) {
        var $forms = $(this),
            settings = Object.assign({}, defaultSettings, settings),
            selector = settings.selector + ':not(' + settings.ignore + '):not(:button)';

        $forms.each(function() {
            var $form = $(this),
                $inputs = $form.find(selector);

            $form.attr('novalidate', true);
            $inputs
                .off('input.validity focusout.validity')
                .on('input.validity focusout.validity', function(e) {
                    var check = inputCheck(e, this, settings);
                    if (!check) {
                        $form.data('valid', check);
                    }
                });
        });

        $.fn.valid = function() {
            var $group = $(this),
                $inputs = $group.find(selector);

            $group.data('valid', true);
            $inputs.each(function(e) {
                var check = inputCheck({
                    type: 'submit'
                }, this, settings);
                if (!check) {
                    $group.data('valid', check);
                }
            });

            return $group.data('valid');
        };

        $.fn.reset = function() {
            var $form = $(this);
            $form.find(':input').removeClass('valid error')
                .filter(':file').parent().removeClass('valid error');
            $form[0].reset();
            return $form;
        };

        return $forms;
    };
})();
