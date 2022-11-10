//import React from "react";
import Editor from "@monaco-editor/react";
import loader from '@monaco-editor/loader';
import './index.css';
import { useState, useRef } from "react";
import { saveAs } from "file-saver";
import axios from "axios";
import $ from 'jquery';
//import { console } from "console";
//import { Code } from "typeorm";
//import { readFile } from "fs";

export default function App(){
  const [processing, setProcessing] = useState(null);
  const [outputDetails, setOutputDetails] = useState(null);
  //ABRIR Y GUARDAR ARCHIVOS
  const [myValue, setMyValue] = useState('');
  const createFile = () => {
    const blob = new Blob([myValue], {type: 'text/plain;charset-utf-8'})
    saveAs(blob, 'mycode.txt');
  }
  const readFile = ( e ) => {
    const file = e.target.files[0];
    if(!file)return;
    const fileReader = new FileReader();

    fileReader.readAsText( file );

    fileReader.onload = () => {
      console.log( fileReader.result );
      setMyValue( fileReader.result);
    }

    fileReader.onerror = () => {
      console.log( fileReader.error );
    }
  }

  //ejecutar
  var REACT_APP_RAPID_API_HOST = 'judge0-ce.p.rapidapi.com';
  var REACT_APP_RAPID_API_KEY = '8501db0337mshb50ffeb1f1faf6bp134061jsn5d9049f4634f';
  var REACT_APP_RAPID_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions'
  const customInput = ''

  const encode = (str) => {
    return btoa(unescape(encodeURIComponent(str || "")))
  }

  const decode = (bytes) => {
    var escaped = escape(atob(bytes || ""));
    try {
      return decodeURIComponent(escaped);
    } catch {
      return unescape(escaped);
    }
  }

  const errorHandler = (jqXHR, txtStatus, error) => {
    console.log(JSON.stringify(jqXHR, null, 4));
  }


  const handleCompile = () => {
    $.ajax({
      url: REACT_APP_RAPID_API_URL + '?base64_encoded=true&wait=false',
      type: 'POST',
      contentType: 'application/json',
      headers: {
        'X-RapidAPI-Key': REACT_APP_RAPID_API_KEY,
        'X-RapidAPI-Host': REACT_APP_RAPID_API_HOST
      },
      data: JSON.stringify({
        'language_id': 63,
        'source_code': encode(myValue),
        'stdin': encode(''),
        'redirect_stderr_to_stdout': true
      }),
      success: (data, status, jqXHR) => {
        console.log(data);
        setTimeout(() => checkStatus(data['token']), 2000)
      },
      error: errorHandler
    })
    // console.log(myValue);
    // setProcessing(true);
    // const formData = {
    //   language_id: 63,
    //   // encode source code in base64
    //   source_code: btoa(myValue),
    //   stdin: btoa(customInput),
    // };
    // const options = {
    //   method: "POST",
    //   url: REACT_APP_RAPID_API_URL,
    //   params: { base64_encoded: "true"},
    //   headers: {
    //     "content-type": "application/json",
    //     "Content-Type": "application/json",
    //     "X-RapidAPI-Host": REACT_APP_RAPID_API_HOST,
    //     "X-RapidAPI-Key":   REACT_APP_RAPID_API_KEY,
    //   },
    //   data: formData,
    // };
    // console.log(options);

    // axios.request(options).then(res => console.log(res))
    // axios
    //   .request(options)
    //   .then(function (response) {
    //     console.log("res.data", response.data);
    //     const token = response.data.token;
    //     checkStatus(token);
    //   })
    //   .catch((err) => {
    //     let error = err.response ? err.response.data : err;
    //     setProcessing(false);
    //     console.log(error);
    //   });
  };

  const checkStatus = async (token) => {
    const options = {
      type: "GET",
      url: REACT_APP_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true"},
      headers: {
        "X-RapidAPI-Host": REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": REACT_APP_RAPID_API_KEY,
      },
      success: (data, status, jqXHR) => {
        if (data['status']['id'] === 1 || data['status']['id'] === 2) {
          console.log(data['status']['description']);
          setTimeout(() => checkStatus(token), 1000);
        }
        else {
          var valor = data['stdout'];
          console.log(valor);
          document.getElementById('valor').innerHTML= valor;


        }
      },
      error: errorHandler
    };

    $.ajax(options);


  //   try {
  //     let response = await axios.request(options);
  //     let statusId = response.data.status?.id;

  //     // Processed - we have a result
  //     if (statusId === 1 || statusId === 2) {
  //       // still processing
  //       setTimeout(() => {
  //         checkStatus(token)
  //       }, 2000)
  //       return
  //     } else {
  //       setProcessing(false)
  //       setOutputDetails(response.data)
  //       //showSuccessToast(`Compiled Successfully!`)
  //       console.log('response.data', response.data)
  //       return
  //     }
  //   } catch (err) {
  //     console.log("err", err);
  //     setProcessing(false);
  //     //showErrorToast();
  //   }
  };




  return(
    <>
      <h1> Code Editor {myValue} </h1>
      <div class="row espaciar">
        <input type="file"
        multiple={false}
        onChange={readFile}/>
        <button>Abrir</button>
        <button onClick={createFile}>Guardar</button>
      </div>
      <div class='col-md-8 centrar'>
      <Editor
        height='70vh'
        width='1000px'
        theme='vs-dark'
        defaultLanguage='javascript'
        value={myValue}
        onChange={ (value) => setMyValue(value)}
      />
      </div>
      <div class='col-xs-1 centrar'>
        <p>consola</p>
      </div>
      <div class="row centrar">
        <button  onClick={handleCompile}>Ejecutar</button>
      </div>

    <div class="container centrar">
      <textarea width ="800px" id='valor'>


      </textarea>
    </div>
    </>
  );
}