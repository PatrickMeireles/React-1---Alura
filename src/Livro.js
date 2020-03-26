import React, { Component } from 'react';
import './index.css';
import $ from 'jquery/';
import InputCustomizado from './componentes/InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

export class FormularioLivro extends Component {
    constructor(){
        super();
        this.state = [{ titulo: '', preco: '', autorId: '' }];
        this.enviaForm = this.enviaForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco= this.setPreco.bind(this);
        this.setAutorId = this.setAutorId.bind(this);
    }

    enviaForm(evento){
        evento.preventDefault();
        $.ajax({
           url:'http://cdc-react.herokuapp.com/api/livros',
           contentType: 'application/json',
           dataType: 'json',
           type: 'POST',
           data: JSON.stringify({titulo: this.state.titulo, 
                                 preco: this.state.preco, 
                                 autorId: this.state.autorId }),
           success: function(resposta){
             var lastTenRows = resposta.slice(Math.max(resposta.length - 10, 1));             
             PubSub.publish('atualiza-lista-livros', lastTenRows); 
             this.setState({titulo: '',
                preco: '',
                autorId: ''});
            }.bind(this),
            error: function (resposta) {
                if (resposta.status === 400) {                    
                    console.log(resposta.responseText);
                    new TratadorErros().publicaErros(JSON.parse(resposta.responseText));
                }
            },
            beforeSend: function () {
                PubSub.publish('limpa-erros',{});
            }
        });
      }
   
      setTitulo(evento){
        this.setState({titulo: evento.target.value});
      }
   
      setPreco(evento){
       this.setState({preco: evento.target.value});
     }
   
     setAutorId(evento){
       this.setState({autorId: evento.target.value});
     }

    render(){
        return(
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="post" >

                    <InputCustomizado id="nome" type="text" name="titulo" label="Titulo" value={this.state.titulo} onChange={this.setTitulo} />
                    <InputCustomizado id="email" type="text" name="preco" label="Preço" value={this.state.preco} onChange={this.setPreco} />

                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label>
                        <select value={ this.state.autorId } name="autorId" onChange={this.setAutorId}>
                            <option value="" >Selecione o Autor</option>
                            {this.props.autores.map(function (autor) {
                                return <option value={autor.id}> {autor.nome} </option>
                            })}
                        </select>
                        {/* <span className="error" id={"erro-"+this.props.name}>{this.state.msgErro}</span> */}
                    </div>

              <div className="pure-control-group">
                <label></label>
                <button type="submit" className="pure-button pure-button-primary">Gravar</button>
              </div>
            </form>
          </div>
        );
    }
}

export class TabelaLivros extends Component {

    render(){
        var livros = this.props.lista.map(function (livro) {
            return (
                <tr key={livro.titulo + livro.autor.id}>
                    <td>{livro.titulo}</td>
                    <td>{livro.autor.nome}</td>
                    <td>{livro.preco}</td>                    
                </tr>
            )
        });

        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Titulo</th>
                            <th>Autor</th>
                            <th>Preço</th>
                        </tr>
                    </thead>
                    <tbody> {livros}</tbody>
                </table>
            </div>
        )
    }
}

export default class LivroAdmin  extends Component {

    constructor(props){
        super(props);
        this.state = {lista: [], autores: []};
    }

    componentDidMount(){
        $.ajax({
            url: 'http://cdc-react.herokuapp.com/api/livros',
            dataType: 'json',
            success: function(resposta){
                var lastTenRows = resposta.slice(Math.max(resposta.length - 10, 1));
                this.setState({lista : lastTenRows});
            }.bind(this)
        })
    
        $.ajax({
            url: 'http://cdc-react.herokuapp.com/api/autores',
            dataType: 'json',
            success: function(resposta){
                var lastTenRows = resposta.slice(Math.max(resposta.length - 10, 1));
                this.setState({autores : resposta});
            }.bind(this)
        })

        PubSub.subscribe('atualiza-lista-livros', function(topicName,data){
			this.setState({lista:data});
		}.bind(this));
    }

    render(){
        return(
            <div>
                <div>
                    <div className="header">
                        <h1>Livros</h1>
                    </div>
                    <div className="content" id="content">
                        <FormularioLivro autores={this.state.autores}/>
                        <TabelaLivros lista={this.state.lista}/>
                    </div>
                </div>
            </div>
        )
    }
}