/*! Editor Fomantic styling 3.0.1 for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

(function(factory){
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['datatables.net-se', 'datatables.net-editor'], function (dt) {
			return factory(window, document, dt);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		var cjsRequires = function (root) {
			if (! root.DataTable) {
				require('datatables.net-se')(root);
			}

			if (! window.DataTable.Editor) {
				require('datatables.net-editor')(root);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root) {
				if (! root) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				cjsRequires(root);
				return factory(root, root.document, root.DataTable);
			};
		}
		else {
			cjsRequires(window);
			module.exports = factory(window, window.document, window.DataTable);
		}
	}
	else {
		// Browser
		factory(window, document, window.DataTable);
	}
}(function(window, document, DataTable) {
'use strict';



//
// Note that this file does use jQuery as Fomantic UI's JS depends on jQuery for
// its modal, so we know that it must be present.
//

/*
 * Set the default display controller to be Semantic UI modal
 */
DataTable.Editor.defaults.display = 'semanticui';

/*
 * Change the default classes from Editor to be classes for Bootstrap
 */
DataTable.util.object.assignDeep(DataTable.Editor.classes, {
	header: {
		wrapper: 'DTE_Header header'
	},
	body: {
		wrapper: 'DTE_Body content'
	},
	footer: {
		wrapper: 'DTE_Footer actions'
	},
	form: {
		tag: 'ui form',
		button: 'ui button',
		buttonInternal: 'ui button',
		buttonSubmit: 'ui button primary',
		content: 'DTE_Form_Content'
	},
	field: {
		wrapper: 'DTE_Field inline fields',
		label: 'right aligned five wide field',
		input: 'eight wide field DTE_Field_Input',

		error: 'error has-error',
		'msg-labelInfo': 'ui small',
		'msg-info': 'ui small',
		'msg-message': 'ui message small',
		'msg-error': 'ui error message small',
		multiValue: 'ui message multi-value',
		multiInfo: 'small',
		multiRestore: 'ui message multi-restore'
	},
	inline: {
		wrapper: 'DTE DTE_Inline ui form'
	},
	bubble: {
		table: 'DTE_Bubble_Table ui form',
		bg: 'ui dimmer modals page transition visible active'
	}
});

DataTable.util.object.assignDeep(DataTable.ext.buttons, {
	create: {
		formButtons: {
			className: 'primary'
		}
	},
	edit: {
		formButtons: {
			className: 'primary'
		}
	},
	remove: {
		formButtons: {
			className: 'negative'
		}
	}
});

DataTable.Editor.fieldTypes.datatable.tableClass = 'ui table';

/*
 * Bootstrap display controller - this is effectively a proxy to the Bootstrap
 * modal control.
 */

// Single shared model for all Editor instances
const dom = {
	modal: null,
	close: null
};
let shown = false;
let lastAppend;
let allowHide = false;

DataTable.Editor.display.semanticui = DataTable.util.object.assignDeep(
	{},
	DataTable.Editor.models.displayController,
	{
		/*
		 * API methods
		 */
		init: function (dte) {
			var $ = DataTable.use('jq');

			if (!dom.modal) {
				// Note that `modal-dialog-scrollable` is BS4.3+ only. It has no effect on 4.0-4.2
				dom.modal = $('<div class="ui modal DTED"></div>');
				dom.close = $('<i class="close icon"/>');
			}

			// Make select lists semantic ui dropdowns if possible
			if ($.fn.dropdown) {
				dte.on('displayOrder.dtesu open.dtesu', function () {
					$.each(dte.s.fields, function (key, field) {
						$('select', field.node()).addClass('fluid').dropdown();
					});
				});
			}

			return DataTable.Editor.display.semanticui;
		},

		open: function (dte, append, callback) {
			var $ = DataTable.use('jq');
			var modal = dom.modal;
			var appendChildren = $(append).children();

			// Because we can't use a single element, we need to insert the existing
			// children back into their previous host so that can be reused later
			if (lastAppend) {
				modal.children().appendTo(lastAppend);
			}

			lastAppend = append;

			// Clean up any existing elements and then insert the elements to
			// display. In Semantic UI we need to have the header, content and
			// actions at the top level of the modal rather than as children of a
			// wrapper.
			modal.children().detach();

			modal
				.append(appendChildren)
				.prepend(modal.children('.header')) // order is important
				.addClass(append.className)
				.prepend(dom.close);

			dom.close
				.attr('title', dte.i18n.close)
				.off('click.dte-se')
				.on('click.dte-se', function () {
					dte.close('icon');
					return false;
				});

			$(document)
				.off('click.dte-se')
				.on('click.dte-se', 'div.ui.dimmer.modals', function (e) {
					if ($(e.target).hasClass('dimmer')) {
						dte.background();
					}
				});

			if (shown) {
				if (callback) {
					callback();
				}
				return;
			}

			shown = true;

			$(modal)
				.modal('setting', {
					autofocus: false,
					closable: false,
					onVisible: function () {
						// Can only give elements focus when shown
						if (dte.s.setFocus) {
							dte.s.setFocus.focus();
						}

						if (callback) {
							callback();
						}
					},
					onHide: function () {
						return allowHide;
					},
					onHidden: function () {
						$(append).append(appendChildren);
						shown = false;
					}
				})
				.modal('show');
		},

		close: function (dte, callback) {
			if (!shown) {
				if (callback) {
					callback();
				}
				return;
			}

			allowHide = true;
			dom.modal.modal('hide');
			allowHide = false;

			lastAppend = null;
			shown = false;

			if (callback) {
				callback();
			}
		},

		node: function () {
			return dom.modal[0];
		}
	}
);


return DataTable.Editor;
}));
