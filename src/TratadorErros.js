import React, {Componenete} from 'react';
import PubSub from 'pubsub-js';

export default class TratadorErros{

    publicaErros(objeto) {
        var erros = objeto.errors;
		for(var index in erros){				
			var erro = erros[index];				
			PubSub.publish("erro-validacao-"+erro.field,erro.defaultMessage);
		}
    }
}