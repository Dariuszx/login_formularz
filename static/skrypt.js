var password;

addEvent( 'firstname', 'change', checkString );
addEvent( 'lastname', 'change', checkString );
addEvent( 'password1', 'keyup', checkPassword );
addEvent( 'password2', 'blur', isTheSame );
addEvent( 'login', 'change', checkForUser );
addEvent( 'email', 'change', checkEmail );
addEvent( 'pesel', 'blur', checkPesel );

COLOR = { GREEN : '#69ff41', DARKRED : '#700000', RED : '#ff3535', BLACK : '#141414', GREY : '#585858' };

function colorInput( pid, borderColor) {

    var array = pid.split( '' );
    var size = pid.length;
    array[ size-1 ] = '';

    pid = '';

    for( var i=0; i < size-1; i++ ) {
        pid += ""+array[i];
    }

    document.getElementById( pid).style.borderColor = borderColor;
}

function addEvent( id, eventType, fun ) { //Id pola, typ zdarzenia, funkcja wywoływana

    var element = document.getElementById( id );

    element.addEventListener( eventType, function() { fun( element, id+"p" ); } );

}

function removeElement( id ) {

    var parent = document.getElementById( id );
    var child = document.getElementById( id + "span" );
    colorInput( id, COLOR.GREY );

    if( !child ) return;

    parent.removeChild( child );
}

function createWarning( id, string ) {

    colorInput( id, COLOR.RED );
    var element = document.createElement("span");
    element.style.color = "red";
    element.setAttribute( 'id', id + "span" );

    var strong = document.createElement( "strong" );
    strong.appendChild( document.createTextNode( string ) );
    strong.style.fontSize = "80%";
    element.appendChild( strong );

    var p = document.getElementById( id );
    p.appendChild( element );
}

function checkString( object, pid ) {

    var string = object.value.toLowerCase();
    var charArray = string.split( '' );

    removeElement( pid );

    if( string.length == 0 ) return;

    if( string.length < 3 ) {
        createWarning( pid, "Za krótkie" );
        return;
    }

    for( var i=0; i < charArray.length; i++ ) {

        if( (charArray[i] < 'a' || charArray[i] > 'z') && ( charArray[i] < 'ą' || charArray[i] > 'ź' ) ) {

            createWarning( pid, "Błąd" );
            return;
        }
    }

}

function checkForUser( object, pid ) {

    var xmlhttp;

    if( object.value.length == 0 ) return;

    if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
    else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

    removeElement( pid );

    xmlhttp.timeout = function() {
        console.error( "The request for specified url timed out.")
    }

    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            var odpowiedzSerwera = JSON.parse( xmlhttp.responseText );
            if( odpowiedzSerwera[object.value] == true ) {
                createWarning( pid, "Login zajęty");
            }
        }
    }

    var url = "http://len.iem.pw.edu.pl/staff/~chaberb/apps/register/check/"+object.value;
    xmlhttp.open('GET', url, true);
    xmlhttp.send( null );
}

function checkPassword( object, pid ) {

    function disable() {
        var haslo2 = document.getElementById( "password2" );
        haslo2.style.background = "black";
        haslo2.setAttribute( 'disabled', 'disabled' );
    }


    var numbers = 0;
    var extraChars = 0;
    var error = 0;

    var string = object.value;

    removeElement( pid );

    if( string.length == 0 ) {
        disable();
        return;
    }

    if( string.length < 5 ) {
        createWarning( pid, "Za krótkie" );
        error++;

    } else {
        var charArray = string.split( '' );

        for( var i=0; i < charArray.length; i++ ) {

            if( charArray[i] < 'a' || charArray[i] > 'z' ) {
                if( charArray[i] >= 0 && charArray[i] <= 9 ) numbers++;
                else extraChars++;
            }
        }

        if( numbers == 0 ) {
            createWarning( pid, "Brak cyfer" );
            error++;
        } else if( extraChars == 0 ) {
            createWarning( pid, "Brak znaków specjalnych" );
            error++;
        } else {
            password = string;
        }
    }

    if( error > 0 ) {
        disable();
    } else {
        var haslo2 = document.getElementById( "password2" );
        haslo2.removeAttribute( 'disabled' );
        haslo2.style.background = "white";
    }
}

function isTheSame( object, pid ) {

    removeElement(pid);

    if( object.value != document.getElementById( 'password1').value ) {
        createWarning( pid, "Nie takie same" );
    }
}

function checkEmail( object, pid ) {

    var email = object.value;

    removeElement( pid );

    if( object.value.length == 0 ) return;

    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if( !re.test(email) ) {
        createWarning( pid, "Nieprawidłowy format" );
    }
}

function checkPesel( object, pid ) {

    removeElement( pid );

    if( object.value.length == 0 ) return;

    var pesel = object.value.split( '' );

    if( pesel.length != 11 ) {
        createWarning( pid, "Nieprawidłowy nr PESEL");
        return;
    }

    for( var i=0; i < pesel.length; i++ ) {
        if( pesel[i] < '0' || pesel[i] > '9' ) {
            createWarning( pid, "Nieprawidłowy nr PESEL" );
            return;
        }
    }

    var rok = pesel[0]+""+pesel[1];
    var miesiac = pesel[2]+""+pesel[3];
    var dzien = pesel[4]+""+pesel[5];
    var nrid =pesel[6]+""+pesel[7]+""+pesel[8]+""+pesel[9]+""+pesel[10];

    if( (parseInt( miesiac ) > 12 && parseInt( miesiac < 21 ) ) || parseInt( miesiac > 22 ) || parseInt( dzien > 31 ) ) {
        createWarning( pid, "Nieprawidłowy nr PESEL" );
        return;
    } else {
        checkDate( dzien, miesiac, rok );
    }

    if( parseInt(pesel[9]) %2 == 0 ) {

        var radio = document.getElementById( 'female');
        radio.setAttribute( 'checked', 'checked' );
        document.getElementById( 'male').setAttribute( 'disabled', 'disabled' );

    } else {

        var radio = document.getElementById( 'male');
        radio.setAttribute( 'checked', 'checked' );
        document.getElementById( 'female').setAttribute( 'disabled', 'disabled' );
    }

}

function checkDate( day, month, year ) {

    if( month <= 12 ) {
        year = "19"+year;
    } else {
        year = "20"+year;
        month = parseInt( month ) - 20;
        if( month < 10 ) month = "0"+month.toString();
        else month = month.toString();
    }

    var date = year+"-"+month+"-"+day;
    document.getElementById( 'birthdate').setAttribute( 'value', date );

}

