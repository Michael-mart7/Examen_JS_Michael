
import { EVENTS } from '../shared/constants.js';

class TaskCategoryModal extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._categories = [];
        this._editingId = null;
    }

    connectedCallback() {
        this.render();
        this.addEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="./css/task-category-modal.css">

            <dialog>
                <header>
                    <h2>Administrar categorías</h2>
                    <button type="button" id="btnCerrar">X</button>
                </header>

                <form id="categoryForm">
                    <label for="categoryName">Nombre de la categoría</label>
                    <input
                        type="text"
                        id="categoryName"
                        maxlength="50"
                        placeholder="Ej.: Universidad"
                        required
                    >

                    <button type="submit" id="btnGuardar">
                        Crear categoría
                    </button>
                    <button type="button" id="btnCancelar" hidden>
                        Cancelar edición
                    </button>
                </form>

                <p id="message"></p>

                <h3>Categorías existentes</h3>
                <ul id="categoryList"></ul>
            </dialog>
        `;
    }

    addEvents() {
        const root = this.shadowRoot;

        root.querySelector('#btnCerrar').addEventListener('click', () => {
            root.querySelector('dialog').close();
        });

        root.querySelector('#categoryForm').addEventListener('submit', (event) => {
            event.preventDefault();

            const name = root.querySelector('#categoryName').value.trim();

            this.dispatchEvent(new CustomEvent(EVENTS.CATEGORY_SAVE, {
                detail: {
                    id: this._editingId,
                    name
                },
                bubbles: true,
                composed: true
            }));
        });

        root.querySelector('#btnCancelar').addEventListener('click', () => {
            this.cancelEdit();
        });
    }

    open(categories) {
        this._categories = categories;
        this.renderCategories();
        this.shadowRoot.querySelector('dialog').showModal();
    }

    setCategories(categories) {
        this._categories = categories;
        this.renderCategories();
    }

    renderCategories() {
        const list = this.shadowRoot.querySelector('#categoryList');

        list.innerHTML = '';

        this._categories.forEach((category) => {
            const item = document.createElement('li');

            const name = document.createElement('span');
            name.textContent = category.name;

            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => {
                this._editingId = category.id;
                this.shadowRoot.querySelector('#categoryName').value = category.name;
                this.shadowRoot.querySelector('#btnGuardar').textContent = 'Actualizar categoría';
                this.shadowRoot.querySelector('#btnCancelar').hidden = false;
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';

            deleteButton.addEventListener('click', () => {

                const confirmed = confirm(
                    `¿Estás seguro de eliminar la categoría "${category.name}"?`
                );

                if (!confirmed) {
                    return;
                }

                this.dispatchEvent(new CustomEvent(EVENTS.CATEGORY_DELETE, {
                    detail: { id: category.id },
                    bubbles: true,
                    composed: true
                }));

            });

            item.append(name, editButton, deleteButton);
            list.appendChild(item);
        });
    }

    cancelEdit() {
        this._editingId = null;
        this.shadowRoot.querySelector('#categoryName').value = '';
        this.shadowRoot.querySelector('#btnGuardar').textContent = 'Crear categoría';
        this.shadowRoot.querySelector('#btnCancelar').hidden = true;
    }

    showMessage(message) {
        this.shadowRoot.querySelector('#message').textContent = message;
    }

    resetForm() {
        this.cancelEdit();
        this.shadowRoot.querySelector('#categoryForm').reset();
    }
}

if (!customElements.get('task-category-modal')) {
    customElements.define('task-category-modal', TaskCategoryModal);
}
