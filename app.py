from flask import Flask, request, render_template
from flask_sqlalchemy import SQLAlchemy
import uuid
import json

NULL = "NULL"
# id | name | description | examples | posted['YES' / 'NO']
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

class Slang:
    def __init__(self, id, name, description, examples, posted):
        self.__id = id  # id
        self.__name = name  # name
        self.__description = description  # description
        self.__examples = examples  # examples
        self.__posted = posted  # posted
 
    @property
    def id(self):
        return self.__id
 
    @property
    def name(self):
        return self.__name
        
    @property
    def description(self):
        return self.__description
 
    @property
    def examples(self):
        return self.__examples
 
    @property
    def posted(self):
        return self.__posted
 
    def __str__(self):
        return "Name: {} \t Description: {} \t Examples: {} \t Id: {} \t Posted: {}".format(self.__name, self.__description, self.__examples, self.__id, self.__posted)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/get', methods=['GET'])
def getSlangs():
    data = db.session.execute(f"SELECT * FROM slangs WHERE posted = 'YES' ORDER BY name").fetchall()
    data_out = []
    for item in data:
        id, name, description, examples, posted = item
        data_out.append({
            'name': name,
            'description': description,
            'id': id,
            'posted': posted,
            'examples': examples,
        })
    return json.dumps({'status': 200, 'data': data_out})

@app.route('/api/getOffers', methods=['GET'])
def getSlangsOffers():
    data = db.session.execute(f"SELECT * FROM slangs WHERE posted = 'NO' ORDER BY name").fetchall()
    data_out = []
    for item in data:
        id, name, description, examples, posted = item
        data_out.append({
            'name': name,
            'description': description,
            'id': id,
            'posted': posted,
            'examples': examples,
        })
    return json.dumps({'status': 200, 'data': data_out})

@app.route('/api/adminAdd', methods=['POST'])
def addSlangAdmin():
    data = json.loads(request.data.decode('utf-8'))
    db.session.execute(f"INSERT INTO slangs VALUES {(str(uuid.uuid4()), data['name'], data['description'], '', 'YES')}")
    db.session.commit()
    return json.dumps({'status': 200, 'data': data})

@app.route('/api/userAdd', methods=['POST'])
def addSlangUser():
    data = json.loads(request.data.decode('utf-8'))
    db.session.execute(f"INSERT INTO slangs VALUES {(str(uuid.uuid4()), data['name'], data['description'], '', 'NO')}")
    db.session.commit()
    return json.dumps({'status': 200, 'data': data})

@app.route('/api/del', methods=['POST'])
def delSlang():  # удалить mark по id
    id = json.loads(request.data.decode('utf-8'))
    req = db.session.execute(f"DELETE FROM slangs WHERE id = '{id}'")
    db.session.commit()
    return json.dumps({'status': 200})

@app.route('/api/postslang', methods=['POST'])
def postSlang():
    id = json.loads(request.data.decode('utf-8'))
    db.session.execute(f"UPDATE slangs SET posted = 'YES' WHERE id = '{id}'")
    db.session.commit()
    return json.dumps({'status': 200})

if __name__ == '__main__':
    app.run(debug=True)
