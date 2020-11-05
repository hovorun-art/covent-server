let url = process.env.URL || '91.227.181.143';
const port = process.env.PORT || 27015;
const token = process.env.TELEGRAM_TOKEN || '1405762516:AAGNTdhjIVDjUlhFeFLIaAPwtP_xiuxrH_s';
const botName = process.env.TELEGRAM_BOTNAME || 'CoVent bot';

const _login = 'odmen';
const _password = 'odmen';

const express = require('express');
var cors = require('cors');
const cookieParser = require('cookie-parser');
const { Bot } = require('./Bot');
const { createDb } = require('./createDb');

const createGUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


const app = express();
app.use(cors())
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true
}))
app.set('view engine', 'ejs');

const db = createDb(createGUID);
const accessTokens = [];
const unregisteredPaths = ['/login', '/logout', '/form', '/property'];
const availableMethods = {
    '/property': {
        'GET': true
    }
}

const availableOrigins = ['chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop', 'http://localhost:3000'];

const firewall = (req, res, next) => {
    next();
    return;

    if (unregisteredPaths.indexOf(req.path) !== -1) {
        const methods = availableMethods[req.path];
        if (!methods) {
            next();
            return;
        }

        const isAvailable = methods[req.method];

        if (isAvailable) {
            next();
            return;
        }
    }

    const authorized = accessTokens.includes(req.headers.authorization);

    if (!authorized) {
        return res.status(403).send('Forbidden');
    }
    next();
};

app.use(firewall)

app.route('/login')
    .post((req, res) => {
        const {
            login,
            password
        } = req.body;

        if (login !== _login || password !== _password) {
            res.status(403).send('Forbidden');
            return;
        }

        const token = Math.random().toString(36).substr(2);
        accessTokens.push(token);

        res.send({
            token
        });

    })

app.route('/logout')
    .post((req, res) => {
        const token = req.headers.authorization;

        if (!token) {
            res.status(403).send('Forbidden');
            return;
        }

        const index = accessTokens.indexOf(token);

        if (index === -1) {
            res.status(403).send('Forbidden');
            return;
        }

        accessTokens.splice(index, 1);
        res.status(403).send('Forbidden');
    })


app.route('/property')
    .get(async (req, res) => {
        const data = await db.get('properties')
            .value()

        res.send(data)
    })
    .post(async (req, res) => {
        const {
            body
        } = req;

        const obj = {
            id: createGUID(),
            ...body
        }

        db.get('properties')
            .push(obj)
            .write();

        res.send(obj)
    })
    .put((req, res) => {

        const {
            body
        } = req;

        db.get('properties')
            .find(a => a.id === body.id)
            .assign(body)
            .write();


        consistantRules();
        res.send(body)
    })
    .delete((req, res) => {
        const {
            id
        } = req.query;

        db.get('properties')
            .remove({ id })
            .write();

        consistantRules();
        res.send({ ok: true })
    });

app.route('/user')
    .get(async (req, res) => {
        res.send(await db.get('users').value())
    })
    .post(async (req, res) => {
        const {
            body
        } = req;

        const id = createGUID();

        const obj = {
            ...body,
            id
        }

        db.get('users')
            .push(obj)
            .write();

        res.send(obj)
    })
    .put((req, res) => {

        const {
            body
        } = req;

        db.get('users')
            .find(a => a.id === body.id)
            .assign(body)
            .write();

        res.send(body)
    })
    .delete((req, res) => {
        const {
            id
        } = req.query;

        db.get('users')
            .remove({ id })
            .write();

        res.send({ ok: true })
    });

app.route('/rules')
    .get(async (req, res) => {
        res.send(await db.get('rules').value())
    })
    .post(async (req, res) => {
        const {
            body
        } = req;

        const id = createGUID();

        const obj = {
            ...body,
            id
        }

        db.get('rules')
            .push(obj)
            .write();

        res.send(obj)
    })
    .put((req, res) => {

        const {
            body
        } = req;

        db.get('rules')
            .find(a => a.id === body.id)
            .assign(body)
            .write();

        res.send(body)
    })
    .delete((req, res) => {
        const {
            id
        } = req.query;

        db.get('rules')
            .remove({ id })
            .write();

        consistantUsers();
        res.send({ ok: true })
    });

app.route('/telegram').post((req, res) => {
    const {
        body
    } = req;

    bot.sendMessage(body.id, 'Covent Test');

    res.send({ ok: true })
})

app.route('/form').post((req, res) => {
    const {
        body
    } = req;

    if (availableOrigins.indexOf(req.headers.origin) === -1) {
        res.status(403).send('Forbidden');
        return;
    }

    const rules = db.get('rules').value();
    const properties = db.get('properties').value();
    const passedRules = [];

    console.log(body);


    for (const rule of rules) {

        const {
            stringSubrules,
            numberSubrules
        } = rule;

        let haveError = false;

        for (sr of stringSubrules) {
            const { propertyId, values } = sr;

            const property = properties.find(a => a.id === propertyId);

            if (!property) {
                logError(`unknown property with id ${propertyId}`);
                continue;
            }

            if (!values.length) {
                logError(`Available values of property ${property.displayName} in rule ${rule.name} is empty`);
                continue;
            }

            const val = body[property.name];

            if (val === null || val === undefined || !val.replace(/\s/g, '').length) {
                haveError = true;
                break;
            }

            const appropriate = values.indexOf(val) !== -1;

            if (!appropriate) {
                haveError = true;
                break;
            }
        }

        if (haveError) {
            continue;
        }

        for (nr of numberSubrules) {
            const { propertyId, equals, moreThen, lessThen } = nr;

            const property = properties.find(a => a.id === propertyId);

            if (!property) {
                logError(`unknown property with id ${propertyId}`);
                continue;
            }

            if (!equals && !moreThen && !lessThen) {
                logError(`Rule ${rule.name} for property ${property.displayName} is empty`);
                continue;
            }

            let val = body[property.name];

            if (val === null || val === undefined || !val.replace(/\s/g, '').length) {
                haveError = true;
                break;
            }

            val = +val;

            if (equals || equals === 0) {
                const appropriate = equals === val;

                if (!appropriate) {
                    haveError = true;
                    break;
                }
            }

            if (moreThen || moreThen === 0) {

                const appropriate = moreThen > val;

                if (!appropriate) {
                    haveError = true;
                    break;
                }
            }

            if (lessThen || lessThen === 0) {

                const appropriate = lessThen > val;

                if (!appropriate) {
                    haveError = true;
                    break;
                }
            }

        }

        if (haveError) {
            continue;
        }

        const users = db.get('users').filter(a => a.ruleIds.indexOf(rule.id) !== -1).value();
        passedRules.push({ rule, users });
    }

    const addedUsers = new Set();
    const usersToNotify = [];

    for (const { users } of passedRules) {

        for (const u of users) {
            if (addedUsers.has(u.id)) {
                continue;
            }
            usersToNotify.push(u);
            addedUsers.set(u.id);
        }
    }

    for (const user of usersToNotify) {
        const rules = passedRules.filter(a => user.ruleIds.indexOf(a.id) !== -1);
        const message = `Сообщение отпралено вам согласно правилам ${rules.map(a => a.name).join(', ')} 
        ${JSON.stringify(body)}
        `;
        try {
            bot.sendMessage(user.telegramId, message);
        } catch (e) {
            logError(e);
        }
    }

    res.send({ ok: false })
});

app.listen(port, () => {
    console.log('app listening at port ' + port);
});

const logError = (error) => {
    db.get('errors').push({ error: JSON.stringify(error), date: new Date() }).write();
}

//TODO: divide this method on two: one will be called on delete property other on update options
const consistantRules = () => {
    db.get('rules').each(rule => {
        var newStringSubrules = [];
        rule.stringSubrules.forEach(sr => {
            var property = db.get('properties').find(p => p.id === sr.propertyId).value();

            if (!property) {
                return;
            }

            sr.values = sr.values.filter(v => !!property.options.find(o => o.value === v));
            newStringSubrules.push(sr)
        });
        rule.stringSubrules = newStringSubrules;

        var newNumberSubrules = [];
        rule.stringSubrules.forEach(sr => {
            var property = db.get('properties').find(p => p.id === sr.propertyId).value();

            if (!property) {
                return;
            }

            newStringSubrules.push(sr)
        });
        rule.numberSubrules = newNumberSubrules;
    })
        .write();
}

//TODO: call this method only for users that contains rule.id in ruleIds on delete rule
const consistantUsers = () => {
    db.get('users').each(user => {
        var newRuleIds = [];
        user.ruleIds.forEach(id => {
            var rule = db.get('rules').find(r => r.id === id).value();

            if (!rule) {
                return;
            }

            newRuleIds.push(id)
        });
        user.ruleIds = newRuleIds;
    })
        .write();
}

const bot = Bot({
    token
});
