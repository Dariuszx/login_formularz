# encoding: utf-8

from flask import Flask, render_template, request, make_response
import time
app = Flask(__name__)
app.secret_key = 'Super tajny klucz'

users = {"dybkad": "123", "chaberb": "qwerty"}
last_correct_login = {"dybkad": "", "chaberb": ""}


@app.route('/')
def start():
    username = request.cookies.get('username')
    if username:
        return get_user_panel_template(username)
    else:
        return render_template('login.html')


@app.route('/login/', methods=['GET', 'POST'])
def login_user():
    error = None

    if is_logged_in():
        return get_user_panel_template(request.cookies.get('username'))

    if request.method == 'POST':
        if request.form['login'] and request.form['password']:
            if valid_login(request.form['login'], request.form['password']):
                resp = make_response(get_user_panel_template(request.form['login']))
                resp.set_cookie('username', request.form['login'])

                now = time.strftime("%c")
                last_correct_login[request.form['login']] = now
                return resp
            else:
                error = "Bledne dane logowania"
        else:
            error = "Nie podano wszystkich danych"
    else:
        error = "Jakis straszny blad"

    return render_template('login.html', error=error)


@app.route('/logout/')
def logout():
    if not is_logged_in():
        return render_template('login.html')

    resp = make_response(render_template('login.html'))
    resp.set_cookie('username', '', expires=0)
    return resp


def is_logged_in():
    if request.cookies.get('username'):
        return True
    else:
       return False


def valid_login(login, password):
    if users.get(login):
        if users.get(login) == password:
            return True
    return False


def get_user_panel_template(username):
    last_login = last_correct_login[username]
    return render_template("panel_uzytkownika.html", username=username, last_login=last_login)


if __name__ == '__main__':
    app.run(debug=True)
