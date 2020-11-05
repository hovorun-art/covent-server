const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync');

const createDb = (createGUID) => {

    const adapter = new FileSync('db.json');
    const db = low(adapter);

    db.defaults({
        users: [],
        rules: [],
        errors: [],
        properties: [
            {
                id: createGUID(),
                name: 'Ситуация',
                displayName: 'Ситуация',
                type: 'string',
                options: [{
                    value: 'Штатная',
                    label: 'Штатная'
                },
                {
                    value: 'Экстренная',
                    label: 'Экстренная'
                }]
            },
            {
                id: createGUID(),
                name: 'Пол',
                displayName: 'Пол',
                type: 'string',
                options: [{
                    value: 'Женский',
                    label: 'Женский'
                },
                {
                    value: 'Мужской',
                    label: 'Мужской'
                }]
            },
            {
                id: createGUID(),
                name: 'Сознание',
                displayName: 'Сознание',
                type: 'string',
                options: []
            },
            {
                id: createGUID(),
                name: 'Дыхание',
                displayName: 'Дыхание',
                type: 'string',
                options: []
            },
            {
                id: createGUID(),
                name: 'Гемодинамика',
                displayName: 'Гемодинамика',
                type: 'string',
                options: []
            },
            {
                id: createGUID(),
                name: 'Вазопресорная поддержка',
                type: 'string',
                displayName: 'Вазопресорная поддержка',
                options: []
            },
            {
                id: createGUID(),
                name: 'ИВЛ',
                type: 'string',
                displayName: 'ИВЛ',
                options: []
            },
            {
                id: createGUID(),
                name: 'Регион',
                displayName: 'Регион',
                type: 'string',
                options: [{
                    value: 'Винницкая',
                    label: 'Винницкая'
                },
                {
                    value: 'Волынская',
                    label: 'Волынская'
                },
                {
                    value: 'Днепропетровская',
                    label: 'Днепропетровская'
                },
                {
                    value: 'Донецкая',
                    label: 'Донецкая'
                },
                {
                    value: 'Житомирская',
                    label: 'Житомирская'
                },
                {
                    value: 'Закарпатская',
                    label: 'Закарпатская'
                },
                {
                    value: 'Запорожская',
                    label: 'Запорожская'
                },
                {
                    value: 'Ивано-Франковская',
                    label: 'Ивано-Франковская'
                },
                {
                    value: 'Киев',
                    label: 'Киев'
                },
                {
                    value: 'Киевская',
                    label: 'Киевская'
                },
                {
                    value: 'Кировоградская',
                    label: 'Кировоградская'
                },
                {
                    value: 'Луганская',
                    label: 'Луганская'
                },
                {
                    value: 'Львовская',
                    label: 'Львовская'
                },
                {
                    value: 'Николаевская',
                    label: 'Николаевская'
                },
                {
                    value: 'Одесская',
                    label: 'Одесская'
                },
                {
                    value: 'Полтавская',
                    label: 'Полтавская'
                },
                {
                    value: 'Ровненская',
                    label: 'Ровненская'
                },
                {
                    value: 'Сумская',
                    label: 'Сумская'
                },
                {
                    value: 'Тернопольская',
                    label: 'Тернопольская'
                },
                {
                    value: 'Харьковская',
                    label: 'Харьковская'
                },
                {
                    value: 'Херсонская',
                    label: 'Херсонская'
                },
                {
                    value: 'Хмельницкая',
                    label: 'Хмельницкая'
                },
                {
                    value: 'Черкасская',
                    label: 'Черкасская'
                },
                {
                    value: 'Черниговская',
                    label: 'Черниговская'
                },
                {
                    value: 'Черновецкая',
                    label: 'Черновецкая'
                }]
            }

        ]
    })
        .write();


    return db;
}

module.exports = { createDb }