/**
 * Elementor Debug Tool - Editor Script
 * Provides real-time schema viewing in the Elementor editor
 */

(function($) {
    'use strict';

    // Debug Tool Class
    class ElementorDebugTool {
        constructor() {
            this.isOpen = false;
            this.currentTab = 'database';
            this.databaseSchema = null;
            this.editorSchema = null;
            this.changeListeners = [];
            this.elementModelListeners = [];
            this.isDragging = false;
            this.dragOffset = { x: 0, y: 0 };
            
            this.init();
        }

        init() {
            // Wait for Elementor to be ready
            if (typeof elementor === 'undefined') {
                $(document).ready(() => {
                    this.waitForElementor();
                });
            } else {
                this.waitForElementor();
            }
        }

        waitForElementor() {
            if (typeof elementor !== 'undefined' && elementor.documents) {
                console.log('Elementor Debug Tool: Elementor detected, initializing...');
                this.createUI();
                this.bindEvents();
				$e.commands.on( 'run:after', ( _component, command, args ) => {
					if ( 'document/elements/select' === command ) {
						 this.callModelEvents();
					}

					if ( 'document/save/update' === command ) {
						this.updateDatabaseSchema();
					}
				} );
            } else {
                console.log('Elementor Debug Tool: Waiting for Elementor...');
                setTimeout(() => this.waitForElementor(), 100);
            }
        }

		callModelEvents() {
			const selectedElements = elementor.selection.getElements();

			if (selectedElements && selectedElements.length > 0) {
				const element = selectedElements[0];

				element.model.on('change', () => {
					console.log('Elementor Debug Tool: Element model change detected', selectedElements[0]);
					this.updateEditorSchema();
					// this.updateDatabaseSchema();
				});

				element.model.on('destroy', () => {
					console.log('Elementor Debug Tool: Element model destroy detected-------', selectedElements[0]);
					this.updateEditorSchema();
					// element.model.off()
					// this.updateDatabaseSchema();
				});

				this.updateEditorSchema();
			}
		}

        createUI() {
            // Create toggle button
            this.toggleButton = $('<button>', {
                class: 'elementor-debug-tool-toggle',
                html: '<i class="eicon-bug"></i>',
                title: elementorDebugTool.strings.debugTool
            });

            // Create popover container
            this.popover = $('<div>', {
                class: 'elementor-debug-tool-popover',
                html: `
                    <div class="elementor-debug-tool-header">
                        <h3>${elementorDebugTool.strings.debugTool}</h3>
                        <button class="elementor-debug-tool-close">
                            <i class="eicon-close"></i>
                        </button>
                    </div>
                    <div class="elementor-debug-tool-tabs">
                        <button class="elementor-debug-tool-tab active" data-tab="database">
                            ${elementorDebugTool.strings.databaseSchema}
                        </button>
                        <button class="elementor-debug-tool-tab" data-tab="editor">
                            ${elementorDebugTool.strings.editorSchema}
                        </button>
                    </div>
                    <div class="elementor-debug-tool-content">
                        <div class="elementor-debug-tool-tab-content active" data-tab="database">
                            <div class="elementor-debug-tool-actions">
                                <button class="elementor-debug-tool-refresh" data-tab="database">
                                    <i class="eicon-sync"></i> Refresh
                                </button>
                                <button class="elementor-debug-tool-copy" data-tab="database">
                                    <i class="eicon-copy"></i> ${elementorDebugTool.strings.copyToClipboard}
                                </button>
                                <button class="elementor-debug-tool-export" data-tab="database">
                                    <i class="eicon-download"></i> ${elementorDebugTool.strings.exportJson}
                                </button>
                            </div>
                            <div class="elementor-debug-tool-json-container">
                                <pre class="elementor-debug-tool-json" id="database-json"></pre>
                            </div>
                        </div>
                        <div class="elementor-debug-tool-tab-content" data-tab="editor">
                            <div class="elementor-debug-tool-actions">
                                <button class="elementor-debug-tool-refresh" data-tab="editor">
                                    <i class="eicon-sync"></i> Refresh
                                </button>
                                <button class="elementor-debug-tool-copy" data-tab="editor">
                                    <i class="eicon-copy"></i> ${elementorDebugTool.strings.copyToClipboard}
                                </button>
                                <button class="elementor-debug-tool-export" data-tab="editor">
                                    <i class="eicon-download"></i> ${elementorDebugTool.strings.exportJson}
                                </button>
                            </div>
                            <div class="elementor-debug-tool-json-container">
                                <pre class="elementor-debug-tool-json" id="editor-json"></pre>
                            </div>
                        </div>
                    </div>
                `
            });

            // Append to body
            $('body').append(this.toggleButton);
            $('body').append(this.popover);

            // Initially hide popover
            this.popover.hide();
            
            // Setup drag functionality
            this.setupDrag();
        }

        setupDrag() {
            const header = this.popover.find('.elementor-debug-tool-header');
            
            // Mouse events
            header.on('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return; // Don't drag if clicking on buttons
                }
                
                this.isDragging = true;
                this.dragOffset.x = e.clientX - this.popover.offset().left;
                this.dragOffset.y = e.clientY - this.popover.offset().top;
                
                header.addClass('dragging');
                e.preventDefault();
            });
            
            $(document).on('mousemove', (e) => {
                if (!this.isDragging) return;
                
                const x = e.clientX - this.dragOffset.x;
                const y = e.clientY - this.dragOffset.y;
                
                // Keep popover within viewport
                const maxX = $(window).width() - this.popover.outerWidth();
                const maxY = $(window).height() - this.popover.outerHeight();
                
                const constrainedX = Math.max(0, Math.min(x, maxX));
                const constrainedY = Math.max(0, Math.min(y, maxY));
                
                this.popover.css({
                    position: 'fixed',
                    left: constrainedX + 'px',
                    top: constrainedY + 'px',
                    right: 'auto',
                    bottom: 'auto'
                });
            });
            
            $(document).on('mouseup', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    header.removeClass('dragging');
                }
            });
            
            // Touch events for mobile
            header.on('touchstart', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }
                
                const touch = e.originalEvent.touches[0];
                this.isDragging = true;
                this.dragOffset.x = touch.clientX - this.popover.offset().left;
                this.dragOffset.y = touch.clientY - this.popover.offset().top;
                
                header.addClass('dragging');
                e.preventDefault();
            });
            
            $(document).on('touchmove', (e) => {
                if (!this.isDragging) return;
                
                const touch = e.originalEvent.touches[0];
                const x = touch.clientX - this.dragOffset.x;
                const y = touch.clientY - this.dragOffset.y;
                
                const maxX = $(window).width() - this.popover.outerWidth();
                const maxY = $(window).height() - this.popover.outerHeight();
                
                const constrainedX = Math.max(0, Math.min(x, maxX));
                const constrainedY = Math.max(0, Math.min(y, maxY));
                
                this.popover.css({
                    position: 'fixed',
                    left: constrainedX + 'px',
                    top: constrainedY + 'px',
                    right: 'auto',
                    bottom: 'auto'
                });
                
                e.preventDefault();
            });
            
            $(document).on('touchend', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    header.removeClass('dragging');
                }
            });
        }
        
        bindEvents() {
            // Toggle button click
            this.toggleButton.on('click', () => {
                this.toggle();
            });

            // Close button
            this.popover.find('.elementor-debug-tool-close').on('click', () => {
                this.close();
            });

            // Tab switching
            this.popover.find('.elementor-debug-tool-tab').on('click', (e) => {
                const tab = $(e.currentTarget).data('tab');
                this.switchTab(tab);
            });

            // Refresh button
            this.popover.find('.elementor-debug-tool-refresh').on('click', (e) => {
                const tab = $(e.currentTarget).data('tab');
                if (tab === 'editor') {
                    this.updateEditorSchema();
                } else if (tab === 'database') {
                    this.updateDatabaseSchema();
                }
            });

            // Copy to clipboard
            this.popover.find('.elementor-debug-tool-copy').on('click', (e) => {
                const tab = $(e.currentTarget).data('tab');
                this.copyToClipboard(tab);
            });

            // Export JSON
            this.popover.find('.elementor-debug-tool-export').on('click', (e) => {
                const tab = $(e.currentTarget).data('tab');
                this.exportJson(tab);
            });

            // Click outside to close - DISABLED to keep popover open
            // $(document).on('click', (e) => {
            //     if (this.isOpen && !$(e.target).closest('.elementor-debug-tool-popover, .elementor-debug-tool-toggle').length) {
            //         this.close();
            //     }
            // });
        }


        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            this.isOpen = true;
            this.popover.show();
            this.toggleButton.addClass('active');
            
            // Reset position to default if it was dragged off-screen
            this.resetPosition();
            
            // Load initial data
            this.updateDatabaseSchema();
            this.updateEditorSchema();
        }

        close() {
            this.isOpen = false;
            this.popover.hide();
            this.toggleButton.removeClass('active');
        }
        
        resetPosition() {
            // Reset to default position (bottom-right)
            this.popover.css({
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                left: 'auto',
                top: 'auto'
            });
        }

        switchTab(tab) {
            this.currentTab = tab;

            // Update tab buttons
            this.popover.find('.elementor-debug-tool-tab').removeClass('active');
            this.popover.find(`[data-tab="${tab}"]`).addClass('active');

            // Update tab content
            this.popover.find('.elementor-debug-tool-tab-content').removeClass('active');
            this.popover.find(`.elementor-debug-tool-tab-content[data-tab="${tab}"]`).addClass('active');
        }

        async updateDatabaseSchema() {
            try {
                const postId = elementor.config.document.id;
                const response = await $.ajax({
                    url: elementorDebugTool.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'elementor_debug_tool_get_database_schema',
                        post_id: postId,
                        nonce: elementorDebugTool.nonce
                    }
                });

                if (response.success) {
                    this.databaseSchema = response.data.schema;
                    this.displayJson('database', this.databaseSchema);
                } else {
                    this.displayError('database', response.data.message || 'Failed to load database schema');
                }
            } catch (error) {
                this.displayError('database', 'Network error: ' + error.message);
            }
        }

        updateEditorSchema() {
            try {
                console.log('Elementor Debug Tool: Updating editor schema...');

                // Method 1: Try elementor.selection.getElements() - This is the correct method!
                if (elementor.selection && elementor.selection.getElements) {
                    const selectedElements = elementor.selection.getElements();
                    console.log('Method 1 - elementor.selection.getElements():', selectedElements);

                    if (selectedElements && selectedElements.length > 0) {
                        // Get the first selected element's model
                        const firstElement = selectedElements[0];
                        if (firstElement && firstElement.model) {
                            const elementData = firstElement.model.toJSON();
                            console.log('Schema from selected element model:', elementData);
                            this.editorSchema = elementData;
                            this.displayJson('editor', this.editorSchema);
                            return;
                        }
                    } else {
                        // No elements selected, show empty
                        console.log('No elements selected, showing empty editor schema');
                        this.editorSchema = null;
                        this.displayJson('editor', 'No element selected. Select an element in the editor to view its schema.');
                        return;
                    }
                }

                // Method 2: Try elementor.selection.getContainer() - Alternative selection method
                if (elementor.selection && elementor.selection.getContainer) {
                    const container = elementor.selection.getContainer();
                    console.log('Method 2 - elementor.selection.getContainer():', container);

                    if (container && container.model) {
                        const containerData = container.model.toJSON();
                        console.log('Schema from container model:', containerData);
                        this.editorSchema = containerData;
                        this.displayJson('editor', this.editorSchema);
                        return;
                    }
                }

                // Method 3: Try elementor.selection.getFirst() - Get first selected element
                if (elementor.selection && elementor.selection.getFirst) {
                    const firstElement = elementor.selection.getFirst();
                    console.log('Method 3 - elementor.selection.getFirst():', firstElement);

                    if (firstElement && firstElement.model) {
                        const elementData = firstElement.model.toJSON();
                        console.log('Schema from first element model:', elementData);
                        this.editorSchema = elementData;
                        this.displayJson('editor', this.editorSchema);
                        return;
                    }
                }

                // Method 4: Try elementor.selection.getCurrent() - Get current selection
                if (elementor.selection && elementor.selection.getCurrent) {
                    const currentSelection = elementor.selection.getCurrent();
                    console.log('Method 4 - elementor.selection.getCurrent():', currentSelection);

                    if (currentSelection && currentSelection.model) {
                        const selectionData = currentSelection.model.toJSON();
                        console.log('Schema from current selection:', selectionData);
                        this.editorSchema = selectionData;
                        this.displayJson('editor', this.editorSchema);
                        return;
                    }
                }

                // Method 5: Try elementor.selection.getActive() - Get active element
                if (elementor.selection && elementor.selection.getActive) {
                    const activeElement = elementor.selection.getActive();
                    console.log('Method 5 - elementor.selection.getActive():', activeElement);

                    if (activeElement && activeElement.model) {
                        const activeData = activeElement.model.toJSON();
                        console.log('Schema from active element:', activeData);
                        this.editorSchema = activeData;
                        this.displayJson('editor', this.editorSchema);
                        return;
                    }
                }

                // If no selection methods work, show empty
                console.log('Elementor Debug Tool: No elements selected');
                this.editorSchema = null;
                this.displayJson('editor', 'No element selected. Select an element in the editor to view its schema.');

            } catch (error) {
                console.error('Elementor Debug Tool - Editor Schema Error:', error);
                this.displayError('editor', 'Error getting editor schema: ' + error.message);
            }
        }

        inspectElementorObject() {
            try {
                console.log('Elementor Debug Tool: Inspecting Elementor object structure...');

                // Inspect elementor.config.document structure
                if (elementor.config && elementor.config.document) {
                    console.log('elementor.config.document keys:', Object.keys(elementor.config.document));
                    console.log('elementor.config.document structure:', elementor.config.document);

                    // Check if document has data property
                    if (elementor.config.document.data) {
                        console.log('elementor.config.document.data type:', typeof elementor.config.document.data);
                        console.log('elementor.config.document.data keys:', Object.keys(elementor.config.document.data));
                    }
                }

                // Inspect elementor.documents structure
                if (elementor.documents) {
                    console.log('elementor.documents keys:', Object.keys(elementor.documents));
                    console.log('elementor.documents methods:', Object.getOwnPropertyNames(elementor.documents));
                }

                // Inspect elementor.editor structure
                if (elementor.editor) {
                    console.log('elementor.editor keys:', Object.keys(elementor.editor));
                    console.log('elementor.editor methods:', Object.getOwnPropertyNames(elementor.editor));
                }

                // Inspect elementor.channels structure
                if (elementor.channels) {
                    console.log('elementor.channels keys:', Object.keys(elementor.channels));
                    console.log('elementor.channels methods:', Object.getOwnPropertyNames(elementor.channels));
                }

                // Inspect window.elementorFrontend
                if (window.elementorFrontend) {
                    console.log('window.elementorFrontend keys:', Object.keys(window.elementorFrontend));
                    console.log('window.elementorFrontend.config:', window.elementorFrontend.config);
                }

                // Inspect window.elementorData
                if (window.elementorData) {
                    console.log('window.elementorData keys:', Object.keys(window.elementorData));
                    console.log('window.elementorData structure:', window.elementorData);
                }

            } catch (error) {
                console.error('Elementor Debug Tool: Error inspecting Elementor object:', error);
            }
        }

        tryGetDataFromDOM() {
            try {
                console.log('Elementor Debug Tool: Trying to get data from DOM...');

                // Try to get data from script tags in the DOM
                const scriptTags = document.querySelectorAll('script[type="application/json"]');
                console.log('Found script tags:', scriptTags.length);

                for (let i = 0; i < scriptTags.length; i++) {
                    const script = scriptTags[i];
                    try {
                        const data = JSON.parse(script.textContent);
                        console.log('Script tag data:', data);

                        // Check if this looks like Elementor data
                        if (data && (data.elements || data.settings || data.content || data.structure)) {
                            console.log('Found Elementor data in script tag:', data);
                            this.editorSchema = data;
                            this.displayJson('editor', this.editorSchema);
                            return;
                        }
                    } catch (e) {
                        // Skip invalid JSON
                        continue;
                    }
                }

                // Try to get data from data attributes
                const elementorElements = document.querySelectorAll('[data-elementor-type]');
                console.log('Found Elementor elements:', elementorElements.length);

                if (elementorElements.length > 0) {
                    const elementorData = [];
                    elementorElements.forEach((element, index) => {
                        const elementData = {
                            type: element.getAttribute('data-elementor-type'),
                            id: element.getAttribute('data-elementor-id'),
                            settings: element.getAttribute('data-elementor-settings'),
                            content: element.innerHTML
                        };
                        elementorData.push(elementData);
                    });

                    if (elementorData.length > 0) {
                        console.log('Found Elementor data from DOM elements:', elementorData);
                        this.editorSchema = elementorData;
                        this.displayJson('editor', this.editorSchema);
                        return;
                    }
                }

                // Try to get data from window object
                if (window.elementorData) {
                    console.log('Found window.elementorData:', window.elementorData);
                    this.editorSchema = window.elementorData;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get data from window.elementorFrontend
                if (window.elementorFrontend && window.elementorFrontend.config) {
                    console.log('Found window.elementorFrontend.config:', window.elementorFrontend.config);
                    this.editorSchema = window.elementorFrontend.config;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                console.log('Elementor Debug Tool: No data found in DOM');

            } catch (error) {
                console.error('Elementor Debug Tool: Error getting data from DOM:', error);
            }
        }

        tryAlternativeEditorSchema() {
            try {
                console.log('Elementor Debug Tool: Trying alternative methods...');

                // Try to get data from Elementor's internal state
                if (window.elementorFrontend && window.elementorFrontend.config && window.elementorFrontend.config.document) {
                    console.log('Alternative Method 1 - window.elementorFrontend.config.document:', window.elementorFrontend.config.document);
                    this.editorSchema = window.elementorFrontend.config.document;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from global Elementor data
                if (window.elementorData && window.elementorData.document) {
                    console.log('Alternative Method 2 - window.elementorData.document:', window.elementorData.document);
                    this.editorSchema = window.elementorData.document;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.data directly
                if (elementor.config && elementor.config.document && elementor.config.document.data) {
                    console.log('Alternative Method 3 - elementor.config.document.data:', elementor.config.document.data);
                    this.editorSchema = elementor.config.document.data;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.settings
                if (elementor.config && elementor.config.document && elementor.config.document.settings) {
                    console.log('Alternative Method 4 - elementor.config.document.settings:', elementor.config.document.settings);
                    this.editorSchema = elementor.config.document.settings;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.elements
                if (elementor.config && elementor.config.document && elementor.config.document.elements) {
                    console.log('Alternative Method 5 - elementor.config.document.elements:', elementor.config.document.elements);
                    this.editorSchema = elementor.config.document.elements;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.content
                if (elementor.config && elementor.config.document && elementor.config.document.content) {
                    console.log('Alternative Method 6 - elementor.config.document.content:', elementor.config.document.content);
                    this.editorSchema = elementor.config.document.content;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.structure
                if (elementor.config && elementor.config.document && elementor.config.document.structure) {
                    console.log('Alternative Method 7 - elementor.config.document.structure:', elementor.config.document.structure);
                    this.editorSchema = elementor.config.document.structure;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.model
                if (elementor.config && elementor.config.document && elementor.config.document.model) {
                    console.log('Alternative Method 8 - elementor.config.document.model:', elementor.config.document.model);
                    this.editorSchema = elementor.config.document.model;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.container
                if (elementor.config && elementor.config.document && elementor.config.document.container) {
                    console.log('Alternative Method 9 - elementor.config.document.container:', elementor.config.document.container);
                    this.editorSchema = elementor.config.document.container;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.widgets
                if (elementor.config && elementor.config.document && elementor.config.document.widgets) {
                    console.log('Alternative Method 10 - elementor.config.document.widgets:', elementor.config.document.widgets);
                    this.editorSchema = elementor.config.document.widgets;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.sections
                if (elementor.config && elementor.config.document && elementor.config.document.sections) {
                    console.log('Alternative Method 11 - elementor.config.document.sections:', elementor.config.document.sections);
                    this.editorSchema = elementor.config.document.sections;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.columns
                if (elementor.config && elementor.config.document && elementor.config.document.columns) {
                    console.log('Alternative Method 12 - elementor.config.document.columns:', elementor.config.document.columns);
                    this.editorSchema = elementor.config.document.columns;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.controls
                if (elementor.config && elementor.config.document && elementor.config.document.controls) {
                    console.log('Alternative Method 13 - elementor.config.document.controls:', elementor.config.document.controls);
                    this.editorSchema = elementor.config.document.controls;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.responsive
                if (elementor.config && elementor.config.document && elementor.config.document.responsive) {
                    console.log('Alternative Method 14 - elementor.config.document.responsive:', elementor.config.document.responsive);
                    this.editorSchema = elementor.config.document.responsive;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.template
                if (elementor.config && elementor.config.document && elementor.config.document.template) {
                    console.log('Alternative Method 15 - elementor.config.document.template:', elementor.config.document.template);
                    this.editorSchema = elementor.config.document.template;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.page
                if (elementor.config && elementor.config.document && elementor.config.document.page) {
                    console.log('Alternative Method 16 - elementor.config.document.page:', elementor.config.document.page);
                    this.editorSchema = elementor.config.document.page;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.post
                if (elementor.config && elementor.config.document && elementor.config.document.post) {
                    console.log('Alternative Method 17 - elementor.config.document.post:', elementor.config.document.post);
                    this.editorSchema = elementor.config.document.post;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.user
                if (elementor.config && elementor.config.document && elementor.config.document.user) {
                    console.log('Alternative Method 18 - elementor.config.document.user:', elementor.config.document.user);
                    this.editorSchema = elementor.config.document.user;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.remote
                if (elementor.config && elementor.config.document && elementor.config.document.remote) {
                    console.log('Alternative Method 19 - elementor.config.document.remote:', elementor.config.document.remote);
                    this.editorSchema = elementor.config.document.remote;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get from elementor.config.document.local
                if (elementor.config && elementor.config.document && elementor.config.document.local) {
                    console.log('Alternative Method 20 - elementor.config.document.local:', elementor.config.document.local);
                    this.editorSchema = elementor.config.document.local;
                    this.displayJson('editor', this.editorSchema);
                    return;
                }

                // Try to get data from DOM elements
                this.tryGetDataFromDOM();

                // If all else fails, show a helpful message
                console.log('Elementor Debug Tool: All alternative methods failed');
                this.displayError('editor', 'Editor schema not available. Make sure you are in the Elementor editor and the page is loaded.');
            } catch (error) {
                console.error('Elementor Debug Tool: Alternative methods error:', error);
                this.displayError('editor', 'Unable to retrieve editor schema: ' + error.message);
            }
        }

        displayJson(tab, data) {
            const jsonElement = this.popover.find(`#${tab}-json`);

            if (typeof data === 'string') {
                // If data is a string (like a message), display it as is
                jsonElement.text(data);
            } else if (data === null || data === undefined) {
                // If data is null/undefined, show empty message
                jsonElement.text('No data available');
            } else {
                // If data is an object/array, format it as JSON
                const formattedJson = JSON.stringify(data, null, 2);
                jsonElement.text(formattedJson);
            }
        }

        displayError(tab, message) {
            const jsonElement = this.popover.find(`#${tab}-json`);
            jsonElement.text(`Error: ${message}`);
        }

        async copyToClipboard(tab) {
            try {
                const jsonElement = this.popover.find(`#${tab}-json`);
                const text = jsonElement.text();

                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(text);
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }

                this.showNotification(elementorDebugTool.strings.copied);
            } catch (error) {
                this.showNotification('Copy failed: ' + error.message);
            }
        }

        exportJson(tab) {
            try {
                const jsonElement = this.popover.find(`#${tab}-json`);
                const text = jsonElement.text();
                const blob = new Blob([text], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `elementor-${tab}-schema-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                this.showNotification('Export failed: ' + error.message);
            }
        }

        showNotification(message) {
            // Create notification element
            const notification = $('<div>', {
                class: 'elementor-debug-tool-notification',
                text: message
            });

            $('body').append(notification);

            // Show notification
            setTimeout(() => notification.addClass('show'), 100);

            // Hide notification
            setTimeout(() => {
                notification.removeClass('show');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }
    }

    // Initialize when DOM is ready
    $( document).ready(() => {
        new ElementorDebugTool();
    });

})(jQuery);
