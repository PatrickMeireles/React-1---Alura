import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado.js';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

export class FormularioAutor extends Component {

  constructor() {
    super();
    this.state = [{ nome: '', email: '', senha: '' }];
    this.enviaForm = this.enviaForm.bind(this);
    this.salvarAlteracao = this.salvarAlteracao.bind(this);
  }

  enviaForm(evento) {
    evento.preventDefault();
    $.ajax({
      url: 'http://cdc-react.herokuapp.com/api/autores',
      contentType: 'application/json',
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify({ nome: this.state.nome, email: this.state.email, senha: this.state.senha }),
      success: function (resposta) {
        var lastTenRows = resposta.slice(Math.max(resposta.length - 10, 1));
        //this.props.callbackAtualizarListagem(lastTenRows);
        //Disparar um aviso geral de novaListagemDisponível
        PubSub.publish('atualiza-lista-autores', lastTenRows);
      }.bind(this),
      error: function (resposta) {
        if (resposta.status === 400) {
          //recuperar os erros
          //exibir mensagem de erro no campo
          //console.log(resposta.responseText);
          new TratadorErros().publicaErros(JSON.parse(resposta.responseText));
        }
      }
    });
  }

  salvarAlteracao(nomeInput, e) {
    //Json
    //var campo = {};
    //campo[nomeInput] = e.target.value;
    this.setState({ [nomeInput]: e.target.value });
  }

  render() {
    return (
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="post" >

          <InputCustomizado id="nome" type="text" name="nome" label="Nome" value={this.state.nome} onChange={this.salvarAlteracao.bind(this,'nome')} />
          <InputCustomizado id="email" type="email" name="email" label="Email" value={this.state.email} onChange={this.salvarAlteracao.bind(this,'email')} />
          <InputCustomizado id="senha" type="password" name="senha" label="Senha" value={this.state.setState} onChange={this.salvarAlteracao.bind(this,'senha')} />

          <div className="pure-control-group">
            <label></label>
            <button type="submit" className="pure-button pure-button-primary">Gravar</button>
          </div>
        </form>
      </div>
    );
  }
}

export class TabelaAutores extends Component {

  render() {
    return (
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>email</th>
            </tr>
          </thead>
          <tbody>
            {this.props.lista.map(function (autor) {
              return (
                <tr key={autor.id}>
                  <td>{autor.nome}</td>
                  <td>{autor.email}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export class AutorBox extends Component {

  constructor() {
    super();
    this.state = { lista: [] };
    this.atualizaLista = this.atualizaLista.bind(this);
  }

  atualizaLista(novaLista) {
    this.setState({ lista: novaLista })
  }

  //componentWillMount - Carrega antes do render
  //componentDidMount - Carrega depois do render
  componentDidMount() {
    $.ajax({
      url: 'http://cdc-react.herokuapp.com/api/autores',
      dataType: 'json',
      success: function (resposta) {
        var lastTenRows = resposta.slice(Math.max(resposta.length - 10, 1));
        this.setState({ lista: lastTenRows });
      }.bind(this)
    })

    PubSub.subscribe('atualiza-lista-autores', function (topico, novaListagem) {
      this.setState({ lista: novaListagem });
    }.bind(this));
  }

  render() {
    return (
      <div>
        <div className="header">
          <h1>Autores</h1>
        </div>
        <div className="content" id="content">
          <FormularioAutor />
          <TabelaAutores lista={this.state.lista} />
        </div>
      </div>
    );
  }
}
export default AutorBox;