function arquivosTeste(IOAddr){
	var arquivosEntrada = []
	var arquivosSaida = []

	var arquivosSaidaUsuario = []
	var compResults = []

	var pastaTestesAlgoritmos = new folder(IOAddr)
	var arqES = pastaTestesAlgoritmos.fileList()
	var testES = pastaTestesAlgoritmos.folderList()
	
	var arqEntradaRegex = /(in\b)|(entrada)|(\x2Ei)/
	var arqSaidaRegex = /(out\b)|(saida)|(\x2Eo)/

	var arquivosES = []
	var pauseMsg = new textfile(program.getPath() + "\\pauseMsg").passThru()

	arqES.downcast("getPath()")
	arqES = arqES.naturalSort()
	
	if (arqES.length > 0){
		arquivosES = arqES
	} else {

		testES.downcast("fileList()")
		testES = testES.untree()
		testES.downcast("getPath()")
		testES = testES.naturalSort()

		arquivosES = testES
	}

	templateArqES = arquivosES.getEnumerationTemplates()
	templateArqES.downcast("source")

	//alert(templateArqES)

	arquivosEntradaTemplate = templateArqES.match(arqEntradaRegex, true)
	arquivosSaidaTemplate = templateArqES.match(arqSaidaRegex, true)

/*
	alert(arquivosEntradaTemplate)
	alert(arquivosSaidaTemplate)

*/
	arquivosEntrada = arquivosES.match(new RegExp(arquivosEntradaTemplate[0]))
	arquivosSaida = arquivosES.match(new RegExp(arquivosSaidaTemplate[0]))

	arquivosEntrada.resultOf("new textfile")
	arquivosSaida.resultOf("new textfile")

	arqEntrada = arquivosEntrada
	arqSaida = arquivosSaida

	this.obtemResultadoTeste = function(){
		return [].copy(compResults)
	}

	this.dividedTests = function(){
		return (arqES.length == 0)
	}

	this.obtemArquivosEntrada = function(){
		return [].copy(arquivosEntrada)
	}

	this.obtemArquivosSaida = function(){
		return [].copy(arquivosSaida)
	}

	function getTesteN_p(endArqTeste){
		nTeste = ""

		if (arquivosES.length == 0){
			pastaCima = endArqTeste.getPath().substring(0, endArqTeste.getPath().lastIndexOf('/')).getSubstring('/','last').numericChars()
			nTeste += pastaCima + "-"
		}

		nTeste += endArqTeste.baseName(true).numericChars()

		return nTeste
	}

	this.getTesteN = function(endArqTeste)	{return getTesteN_p(endArqTeste)}


	this.testar = function(exeApp, comentariosAdicionais){
		var testesOK = 0

		interruptor = new textfile(program.getPath() + "\\temp\\interromperSaidaAtual.bat")
		interruptor.create("taskkill /f /im \""+exeApp.baseName(true)+"\"")

		matador = new textfile(program.getPath() + "\\temp\\pararSaidaAtual.bat")
		matador.create("taskkill /f /im cmd.exe")

		for (s = 0; s < arquivosEntrada.length; s++){ //&& programa.compilacaoEmAndamento
			document.getElementById('statusCodigoFonte').innerText = "Gerando saída " + (s+1) + " de " +  arquivosEntrada.length
			arquivoBat = new textfile(program.getPath() + "\\temp\\gerarSaidas"+(s+1)+".bat")
			comando = "\""+exeApp.getPath()+"\" < \""+arquivosEntrada[s].getPath()+"\" > arqSaida" + (s+1)
			arquivoBat.create(comando)

			SetCurrentDirectory(program.getPath() + "\\temp\\userOutput")
			ExecAndWait(arquivoBat.getPath())
		}

		if (!programa.compilacaoEmAndamento) {
			document.getElementById('statusCodigoFonte').innerText = "Interrompido pelo operador"
			return "Loop infinito em todas as entradas"
		}

		saidaUsuario = new folder(home + "\\temp\\userOutput")

		arquivosSaidaUsuario = saidaUsuario.fileList()
		arquivosSaidaUsuario.downcast("getPath()")
		arquivosSaidaUsuario = arquivosSaidaUsuario.naturalSort()
		arquivosSaidaUsuario.resultOf("new textfile")

		arqSaidaUsuario = arquivosSaidaUsuario

		var jaInseriuNota = false

		for (hh = 0; hh < arquivosSaidaUsuario.length; hh++){
			var arqReferencia = new String(arquivosSaida[hh].passThru()).fixLineBreak()
			var arqSaidaAluno = new String(arquivosSaidaUsuario[hh].passThru()).fixLineBreak()
			var arqReferenciaTrim = arqReferencia.fullReplace(pauseMsg,"").removeAnySpaces().toUpperCase()
			var arqSaidaAlunoTrim = arqSaidaAluno.fullReplace(pauseMsg,"").removeAnySpaces().toUpperCase()

			if (isNumericOutput){
				arqReferenciaTrim = arqReferenciaTrim.numericOutput()
				arqSaidaAlunoTrim = arqSaidaAlunoTrim.numericOutput()
			}

			//alert(arqReferenciaTrim.escape() + lineBreak + lineBreak + arqSaidaAlunoTrim.escape())

			if (arqReferencia == arqSaidaAluno){

				compResults[hh] = 1
				testesOK++

				
			} else if (arqReferenciaTrim == arqSaidaAlunoTrim){ //arqReferenciaTrim.length == arqSaidaAlunoTrim.length
		

				if (!jaInseriuNota){
					comentariosAdicionais_append = "Saída original fora do padrão" //"EspaÃ§os, Quebra de linha adicionais e/ou caixa alta/baixa desconsiderados"
					if (!comentariosAdicionais){
						comentariosAdicionais = comentariosAdicionais_append
					} else {
						comentariosAdicionais += ", " + comentariosAdicionais_append
					}
					jaInseriuNota = true
				}

				compResults[hh] = 1
				testesOK++


			} else {
				compResults[hh] = 0
			}

		}

		var comentario = ""

		if (testesOK == arquivosSaida.length){

			comentario = "Todas as saídas OK"

		} else if (testesOK == arquivosSaida.length-1){

			comentario = "Erro na saída "

			for (cc = 0; cc < compResults.length; cc++){
				if (compResults[cc] != 1) comentario += getTesteN_p(arquivosSaida[cc])
			}

			comentario += ", demais OK"				

		} else if (testesOK == 0){

			comentario = "Erro em todas as saídas"

		} else if (testesOK == 1){
			
			comentario = "Apenas a saída "

			for (cc = 0; cc < compResults.length; cc++){
				if (compResults[cc] == 1) comentario += getTesteN_p(arquivosSaida[cc])
			}

			comentario += " está OK"

		} else if (testesOK >= arquivosSaida.length/2) {
			comentario = "Erro em "

			erroSaida = arquivosSaida.length - testesOK
			comentario += erroSaida + " saídas de um total de " + arquivosSaida.length 

		} else {

			comentario += testesOK + " saídas OK de um total de " + arquivosSaida.length

		}

		if (comentariosAdicionais != "") comentario += " (" + comentariosAdicionais + ")"

		document.getElementById('statusCodigoFonte').innerText = "Pronto"
		return comentario
	}

}