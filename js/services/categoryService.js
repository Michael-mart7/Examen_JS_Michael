import { CATEGORIES_STORAGE_KEY } from '../shared/constants.js';

let categories = [];

//Validación de información
function isvalidCategory(category){
    return (
        category &&
        typeof category.id === 'string' &&
        typeof category.name === 'string' &&
        category.name.trim() !== ''
    );
}

function persist() {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        return { ok: true };
}

function commit(){
    try {
        persist();
        return { ok: true, data: getCategories()};

    }catch(error){
        return{
            ok: false,
            message: 'No se pudieron guardar las categorías'
        };
    }
}

export function loadCategories(){
    try{
        const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (saved === null){
            categories = [];
            return { ok: true, data: []};
        }
        const parsed =JSON.parse(saved);
        if (!Array.isArray(parsed)){
            throw new Error('Formato inválido');
        }

        categories = parsed.filter(isvalidCategory);
        return { ok: true, data: getCategories()};
    }catch (error) {
        categories = [];
        return {ok: false, message: 'No se han podido leer las categorías almacenadas'};
    };
}

export function getCategories(){
    return categories.map(function(category){
        return {... category };
    });
}

export function addCategory(name){
    const cleanName = name.trim();

    if (!cleanName){
        return {
            ok: false, message: 'Escriba el nombre de la categoría'};
    }

    const exists = categories.some(function (category){
        return category.name.toLowerCase() === cleanName.toLowerCase();
    });

    if (exists){
        return {
            ok: false, message: 'Esa categoría ya existe'
        };
    }
    const category = {
        id: 'category-' + crypto.randomUUID(),
        name: cleanName
    };
    categories.push(category);
    return commit();
}

export function updateCategory(id, name){
    const cleanName = name.trim();

    if (!cleanName){
        return { ok: false, message: 'Escribe el nombre de la categoría'};
    }
    const category = categories.find(function (item){
        return item.id === id;
    });

    if (!category){
        return { ok: false, message: 'No se encontró la categoría'};
    }

    const exists = categories.some(function (item){
        return item.id !== id  &&
        item.name.toLowerCase() === cleanName.toLowerCase();
    });

    if(exists){
        return{ ok: false, message: 'Ya existe otra categoría con ese nombre'};
    }

    category.name = cleanName;
    return commit();
}

export function deleteCategory(id, tasks = []){
    const assigned = tasks.some(function (task){
        return task.categoryId === id;
    });

    if (assigned){
        return { ok: false, message: 'No puedes eliminar una categoría que tiene tareas asignadas'};

    };

    const previousLength = categories.length;
    categories = categories.filter(function (category){
        return category.id !== id;
    });

    if (categories.length === previousLength){
        return {ok: false, message: 'No se encontró la categoría'};
    }
    return commit ();
}