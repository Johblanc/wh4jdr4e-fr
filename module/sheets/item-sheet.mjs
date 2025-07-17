import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the ApplicationV2 framework for item sheets
 * @extends {foundry.applications.sheets.ItemSheetV2}
 */
export class Wfjdr4eItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['wh4jdr4e-fr', 'sheet', 'item'],
    position: {
      width: 520,
      height: 480
    },
    window: {
      resizable: true
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: false
    }
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/wh4jdr4e-fr/templates/item/parts/item-header.hbs"
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs"
    },
    description: {
      template: "systems/wh4jdr4e-fr/templates/item/parts/item-description.hbs",
      scrollable: [""]
    },
    details: {
      template: "systems/wh4jdr4e-fr/templates/item/parts/item-details.hbs"
    },
    effects: {
      template: "systems/wh4jdr4e-fr/templates/item/parts/item-effects.hbs"
    }
  };

  /** @override */
  get template() {
    // Check if there's a specific template for this item type
    const type = this.item.type;
    return `systems/wh4jdr4e-fr/templates/item/item-${type}-sheet.hbs`;
  }

  /** @override */
  get title() {
    return `${this.item.name} - ${game.i18n.localize(CONFIG.WFJDR4E.types.Item[this.document.type])}`;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    // Prepare active effects for easier access
    const effects = prepareActiveEffectCategories(this.document.effects);

    // Prepare base context
    const mergedContext = foundry.utils.mergeObject(context, {
      item: this.document, // Maintain compatibility with existing templates
      system: itemData.system,
      flags: itemData.flags,
      effects,
      config: CONFIG.WFJDR4E,
      editable: this.isEditable,
      displaykeys: Object.entries(CONFIG.WFJDR4E.keys.Item[this.document.type] || {}).reduce((acc, [key, value]) => {
        acc[key] = game.i18n.localize(value);
        return acc;
      }, {}),
      tabs: this._getTabs()
    });

    // Add specific data for stuff_feature items
    if (this.document.type === 'stuff_feature') {
      mergedContext.config.stuffFeatureCategory = CONFIG.WFJDR4E.stuffFeatureCategory;
      mergedContext.config.stuffFeatureDivision = CONFIG.WFJDR4E.stuffFeatureDivision;
    }

    return mergedContext;
  }

  /**
   * Prepare tabs for the sheet
   */
  _getTabs() {
    const tabs = {
      description: { id: "description", group: "primary", label: "WFJDR4E.Description" },
      details: { id: "details", group: "primary", label: "WFJDR4E.Details" }
    };

    if (this.document.effects.size > 0) {
      tabs.effects = { id: "effects", group: "primary", label: "WFJDR4E.Effects" };
    }

    return tabs;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    // Add event listeners for effects
    this.element.addEventListener('click', (event) => {
      if (event.target.matches('.effect-control')) {
        onManageActiveEffect(event, this.document);
      }
    });

    // Add event listener for editor-edit button
    this.element.addEventListener('click', (event) => {
      if (event.target.matches('.editor-edit')) {
        this._onEditorEdit(event);
      }
    });

    // Add specific event listeners for stuff_feature items
    if (this.document.type === 'stuff_feature') {
      // Listen for category changes to dynamically show/hide fields
      const categorySelect = this.element.querySelector('#category-select');
      if (categorySelect) {
        categorySelect.addEventListener('change', this._onCategoryChange.bind(this));
      }

      // Listen for division changes if needed
      const divisionSelect = this.element.querySelector('#division-select');
      if (divisionSelect) {
        divisionSelect.addEventListener('change', this._onDivisionChange.bind(this));
      }
    }
  }



  /**
   * Handle category change for stuff_feature items
   */
  async _onCategoryChange(event) {
    const newCategory = event.target.value;

    // Clean up Quill editor before updates
    this._cleanupQuillEditor();

    // Update the item with the new category
    await this.document.update({
      'system.category': newCategory
    });

    // Update the image based on new category and category
    const newImage = `systems/wh4jdr4e-fr/assets/stuff_feature/stuff_feature_${this.document.system.division}_${newCategory}.svg`;
    await this.document.update({
      img: newImage
    });
  }

  /**
   * Handle division change for stuff_feature items
   */
  async _onDivisionChange(event) {
    const newDivision = event.target.value;

    // Clean up Quill editor before updates
    this._cleanupQuillEditor();

    // Update the item with the new division
    await this.document.update({
      'system.division': newDivision
    });

    // Update the image based on new category and division
    const newImage = `systems/wh4jdr4e-fr/assets/stuff_feature/stuff_feature_${newDivision}_${this.document.system.category}.svg`;
    await this.document.update({
      img: newImage
    });
  }

  /** @override */
  async _renderHTML(context, options) {
    // Use the template specified in the get template() method
    const template = this.template;
    return foundry.applications.handlebars.renderTemplate(template, context);
  }

  /** @override */
  _replaceHTML(result, content, options) {
    // For stuff_feature items, check if we need to reinitialize Quill
    if (this.document.type === 'stuff_feature') {
      const existingEditor = this.element?.querySelector('#description-editor .quill-wrapper');

      // Only clean up and reinitialize if the editor doesn't exist or is broken
      if (!existingEditor || !this.quillEditor) {
        this._cleanupQuillEditor();

        // Standard replacement
        content.innerHTML = result;

        // Initialize Quill editor after HTML is rendered
        this._initializeQuillEditor();
      } else {
        // Just update the content without touching the editor
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = result;

        // Update only non-editor parts
        const newContent = tempDiv.querySelector('.sheet-body');
        const currentContent = content.querySelector('.sheet-body');

        if (newContent && currentContent) {
          // Preserve the editor while updating other elements
          const editorContainer = currentContent.querySelector('#description-editor');
          if (editorContainer) {
            const editorClone = editorContainer.cloneNode(true);
            currentContent.innerHTML = newContent.innerHTML;
            const newEditorContainer = currentContent.querySelector('#description-editor');
            if (newEditorContainer) {
              newEditorContainer.parentNode.replaceChild(editorClone, newEditorContainer);
            }
          }
        } else {
          // Fallback to normal replacement
          content.innerHTML = result;
        }
      }
    } else {
      // Standard replacement for non-stuff_feature items
      content.innerHTML = result;
    }

    return content;
  }

  /** @override */
  async _updateObject(event, formData) {
    // Ensure the name field is preserved if not explicitly set
    if (!formData.name && this.document.name) {
      formData.name = this.document.name;
    }

    // Update the document with the form data
    return await this.document.update(formData);
  }

  /** @override */
  _onChangeForm(formConfig, event) {
    // Override to ensure proper data handling
    const target = event.target;

    // Skip processing if the target doesn't have a name attribute
    if (!target.name) return;

    // For description field, handle auto-save with debounce
    if (target.name === 'system.description') {
      this._debounceDescriptionUpdate(target.value);
    }

    // Call the parent method to handle the change
    super._onChangeForm(formConfig, event);
  }

  /**
   * Debounced update for description field
   */
  _debounceDescriptionUpdate(value) {
    // Clear existing timeout
    if (this._descriptionUpdateTimeout) {
      clearTimeout(this._descriptionUpdateTimeout);
    }

    // Set new timeout for auto-save
    this._descriptionUpdateTimeout = setTimeout(async () => {
      try {
        // Update the document without triggering a re-render
        const currentDescription = this.document.system.description;
        if (currentDescription !== value) {
          console.log('Description auto-saving...');
          await this.document.update({ 'system.description': value }, { render: false });
          console.log('Description auto-saved');
        }
      } catch (error) {
        console.error('Error auto-saving description:', error);
      }
    }, 2000); // Increased to 2 seconds to reduce frequency
  }

  /**
   * Initialize the Quill rich text editor
   */
  async _initializeQuillEditor() {
    // Prevent multiple simultaneous initializations
    if (this._isInitializingQuill) {
      console.log('Quill initialization already in progress, skipping...');
      return;
    }

    console.log('Attempting to initialize Quill editor');
    this._isInitializingQuill = true;

    // Clean up any existing editor first
    this._cleanupQuillEditor();

    // Function to actually initialize Quill
    const initQuill = async () => {
      const editorContainer = this.element.querySelector('#description-editor');
      const hiddenInput = this.element.querySelector('input[name="system.description"]');

      console.log('Editor container found:', !!editorContainer);
      console.log('Hidden input found:', !!hiddenInput);

      if (!editorContainer || !hiddenInput) {
        console.error('Missing DOM elements for Quill editor');
        this._createFallbackTextarea(editorContainer, hiddenInput);
        return;
      }

      // Try to load Quill if not available
      if (typeof Quill === 'undefined') {
        console.log('Quill not found, attempting to load...');
        try {
          await this._loadQuill();
        } catch (error) {
          console.error('Failed to load Quill:', error);
          this._createFallbackTextarea(editorContainer, hiddenInput);
          return;
        }
      }

      try {
        console.log('Initializing Quill...');

        // Create a wrapper div for better control
        const quillWrapper = document.createElement('div');
        quillWrapper.className = 'quill-wrapper';

        // Create editor div
        const editorDiv = document.createElement('div');

        // Append to wrapper
        quillWrapper.appendChild(editorDiv);

        // Clear and append to container
        editorContainer.innerHTML = '';
        editorContainer.appendChild(quillWrapper);

        // Initialize Quill with standard toolbar configuration
        const quillConfig = {
          theme: 'snow',
          readOnly: !this.isEditable
        };

        // Only add toolbar if the editor is editable
        if (this.isEditable) {
          quillConfig.modules = {
            toolbar: {
              container: [
                ['bold', 'italic', 'underline'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link'],
                ['clean']
              ]
            }
          };
        } else {
          // No toolbar for readonly mode
          quillConfig.modules = {
            toolbar: false
          };
        }

        const quill = new Quill(editorDiv, quillConfig);

        console.log('Quill initialized successfully');

        // Add data attributes to help with CSS styling
        if (!this.isEditable) {
          quillWrapper.setAttribute('data-readonly', 'true');
          editorContainer.setAttribute('data-readonly', 'true');
          editorDiv.classList.add('ql-disabled');

          // Remove any existing tooltips and disable tooltip creation
          setTimeout(() => {
            const tooltips = quillWrapper.querySelectorAll('.ql-tooltip');
            tooltips.forEach(tooltip => {
              tooltip.remove();
            });

            // Disable link tooltips specifically
            if (quill.theme && quill.theme.tooltip) {
              quill.theme.tooltip.hide();
              quill.theme.tooltip.root.style.display = 'none';
            }
          }, 100);
        }

        // Set initial content
        if (hiddenInput.value) {
          quill.root.innerHTML = hiddenInput.value;
        }

        // Update hidden input when content changes
        quill.on('text-change', (delta, oldDelta, source) => {
          // Only process user changes, not programmatic ones
          if (source === 'user') {
            hiddenInput.value = quill.root.innerHTML;

            // Debounce the description update without triggering form events
            this._debounceDescriptionUpdate(hiddenInput.value);
          }
        });

        // Store reference for later use
        this.quillEditor = quill;
        this._isInitializingQuill = false;
      } catch (error) {
        console.error('Error initializing Quill:', error);
        this._createFallbackTextarea(editorContainer, hiddenInput);
        this._isInitializingQuill = false;
      }
    };

    // Try to initialize with a delay
    setTimeout(() => {
      initQuill().finally(() => {
        this._isInitializingQuill = false;
      });
    }, 100);
  }

  /**
   * Clean up existing Quill editor
   */
  _cleanupQuillEditor() {
    console.log('Cleaning up existing Quill editor');

    // Reset initialization flag
    this._isInitializingQuill = false;

    // Remove existing Quill instance
    if (this.quillEditor) {
      try {
        // Destroy the existing Quill instance
        delete this.quillEditor;
      } catch (error) {
        console.error('Error cleaning up Quill:', error);
      }
    }

    // Remove any existing toolbars from the entire sheet element
    if (this.element) {
      // Find all Quill toolbars in the sheet
      const existingToolbars = this.element.querySelectorAll('.ql-toolbar');
      console.log(`Found ${existingToolbars.length} existing toolbars to remove`);

      existingToolbars.forEach((toolbar, index) => {
        console.log(`Removing toolbar ${index + 1}`);
        if (toolbar.parentNode) {
          toolbar.parentNode.removeChild(toolbar);
        }
      });

      // Also remove any Quill containers
      const existingContainers = this.element.querySelectorAll('.ql-container');
      existingContainers.forEach(container => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });

      // Clear the editor container completely
      const editorContainer = this.element.querySelector('#description-editor');
      if (editorContainer) {
        editorContainer.innerHTML = '';
        // Remove any Quill-related classes
        editorContainer.className = 'quill-editor';
      }
    }
  }

  /**
   * Dynamically load Quill library
   */
  async _loadQuill() {
    return new Promise((resolve, reject) => {
      // Load CSS first
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'systems/wh4jdr4e-fr/lib/quill/quill.snow.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'systems/wh4jdr4e-fr/lib/quill/quill.min.js';
      script.onload = () => {
        console.log('Quill loaded successfully');
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Quill script'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Create a fallback textarea if Quill fails
   */
  _createFallbackTextarea(container, hiddenInput) {
    if (!container || !hiddenInput) return;

    console.log('Creating fallback textarea');

    const textarea = document.createElement('textarea');
    textarea.name = 'system.description';
    textarea.value = hiddenInput.value || '';
    textarea.style.width = '100%';
    textarea.style.minHeight = '150px';
    textarea.style.fontFamily = 'Roboto, sans-serif';
    textarea.style.padding = '8px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.borderRadius = '4px';
    textarea.style.resize = 'vertical';

    if (!this.isEditable) {
      textarea.disabled = true;
    }

    // Add event listeners for real-time updates
    const updateValue = () => {
      hiddenInput.value = textarea.value;

      // Trigger change event for FoundryVTT to detect the change
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', { value: hiddenInput });
      hiddenInput.dispatchEvent(changeEvent);

      // Also trigger the form change handler directly
      this._onChangeForm({}, { target: hiddenInput });
    };

    // Listen for various events to ensure updates are captured
    textarea.addEventListener('input', updateValue);
    textarea.addEventListener('change', updateValue);
    textarea.addEventListener('blur', updateValue);
    textarea.addEventListener('keyup', updateValue);

    // Replace the container content
    container.innerHTML = '';
    container.appendChild(textarea);

    // Keep the hidden input but update its value when textarea changes
    hiddenInput.style.display = 'none';

    // Initial sync
    updateValue();
  }
}
