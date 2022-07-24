function codigoFonte(linha){
	var arquivoAluno = false
	var nomeAluno = false
	var nomeAlunoUp = false
	var codigoFonteAluno
	var codigoFonteAnalise
	var nomeAlunoUp = false
	var obtemExtensao = ""
	var matchCount = 0
	var nomeAlunoPlan = ""

	planilhaResultado.selectCell("B", linha)
	nomeAlunoPlan = planilhaResultado.getActiveCellContent()		

	for (arq = 0; arq < trabalhosSubmetidos.length && !matchCount; arq++){

		nomeAluno = trabalhosSubmetidos[arq].baseName().formataNome()
		nomeAlunoUp = nomeAluno.toUpperCase()


		if (nomeAlunoUp.getSubstring(" ",0) == nomeAlunoPlan.getSubstring(" ",0)){

			for (cI = 1; cI <= nomeAlunoPlan.matchLength(" ") && !matchCount; cI++){
				for (cJ = 1; cJ <= nomeAluno.matchLength(" ") && !matchCount; cJ++){

					if (nomeAlunoPlan.getSubstring(" ",cI) == nomeAlunoUp.getSubstring(" ",cJ) && !nomeAlunoPlan.getSubstring(" ",cI).compare(["de","da","e"], true)){

						arquivoAluno = trabalhosSubmetidos[arq].getPath()
						codigoFonteAluno = new textfile(arquivoAluno)
						codigoFonteAnalise = codigoFonteAluno.passThru()
						obtemExtensao = new String(codigoFonteAluno.getExtension()).toUpperCase()

						matchCount++

					}
				}
			}

		}
	}

	if (!matchCount){
		nomeAluno = false
		nomeAlunoUp = false
	}

	
	this.extensao = function()		{return obtemExtensao}
	this.obtemLinha = function()		{return linha}
	this.obtemIndiceTabela = function()	{return linha-3}
	this.retornaNomePlanilha = function()	{return nomeAlunoPlan}
	this.retornaNomeDetectado = function()	{return nomeAluno}

	this.obtemEnderecoCodigoFonte = function(){
		if (!codigoFonteAluno) return false
		return codigoFonteAluno.getPath()
	}



	this.foiVerificado = function(){

		planilhaResultado.selectCell(colunaExercicio, linha)
		pegaConteudo = planilhaResultado.getActiveCellContent()

		if (pegaConteudo){
			pegaConteudo = new String(pegaConteudo).trim()

			if (pegaConteudo != "") return true
			else return false

		} else return false

	}

	this.comentario = function(){
		if (this.foiVerificado()){

			planilhaResultado.selectCell(colunaExercicio, linha)
			return planilhaResultado.getActiveCellContent()
			
		} else return undefined
	}

	function comentar_p(comentario){
		planilhaResultado.selectCell(colunaExercicio, linha)
		planilhaResultado.setActiveCellContent(comentario)
		planilhaResultado.save()
	}

	this.comentar = function(comentario){
		comentar_p(comentario)
	}

	function etiquetas_p(){
		if (!codigoFonteAluno) return false

		var flagContent = []

		detectarSaidasAdicionais = /(<<\s*\x22)|(digite)|(:\s*\x22)/gi

		if (isNumericOutput && detectarSaidasAdicionais.test(codigoFonteAnalise)){
			 flagContent.push("possui saídas adicionais")
		}

		detectarSystemPause = /[^\x2F]{2,}\s*system\s*\x28\s*"\s*pause\s*"\s*\x29/gi


		if (detectarSystemPause.test(codigoFonteAnalise)){
			flagContent.push("system(\"Pause\") detectado")
		}

		if (!obtemExtensao.compare(["C", "CPP"])){
			flagContent.push("Enviou arquivo " + obtemExtensao)
		}

		return flagContent.join(', ')
	}

	this.ECodigoFonte = function(){
		if (obtemExtensao.compare(["C", "CPP"])) return true
		return false
	}

	this.etiquetas = function(){
		return etiquetas_p()
	}

	this.alterarCodigoFonte = function(inputText){
		if (!codigoFonteAluno) return false
		codigoFonteAluno.create(inputText)
	}

	this.obterCodigoFonte = function(){
		if (!codigoFonteAluno) return false

		if (codigoFonteAluno.getSize() && !codigoFonteAluno.isBinary()){
			return codigoFonteAluno.passThru()
		} else return ""
	}

	this.obterMensagemCompilador = function(){
		arqMensagemCompilador = new textfile(program.getPath() + "\\temp\\errorMsg")
		mensagemCompilador = arqMensagemCompilador.passThru().trim()
		mensagemCompilador = mensagemCompilador.split(lineBreak)

		entryLog = document.getElementById('compilerMessage')
		glEntryLog = new graphicList(entryLog)
		glEntryLog.setInstancePointer(glEntryLog)
		glEntryLog.setActiveLineClassName('selected')
		glEntryLog.clearAll()

		for (f = 0; f < mensagemCompilador.length; f++){
			newEntry = entryLog.insertRow()

			newEntry_cnt = newEntry.insertCell()
			newEntry_cnt.innerText = mensagemCompilador[f].getSubstring(":",2)

			if (f == 0){
				sourceCodeView.selectLine(parseInt(newEntry_cnt.innerText)-1)
			}

			newEntry_cnt = newEntry.insertCell()
			newEntry_cnt.innerText = mensagemCompilador[f].getSubstring(":",3)
			newEntry_cnt = newEntry.insertCell()
			mensagemComposta = ""

			for (f2 = 4; mensagemCompilador[f].getSubstring(":", f2) !== undefined; f2++){
				mensagemComposta += mensagemCompilador[f].getSubstring(":",f2) + ":"
			}

			mensagemComposta = mensagemComposta.deleteLastChar()
			newEntry_cnt.innerText = mensagemComposta
		}

		glEntryLog.makeLinesSelectable()

		
	}

	this.compilar = function(){
		if (!codigoFonteAluno) return false
		SetCurrentDirectory(home + "\\temp")

		switch (obtemExtensao){
			case "C":
				linhaDeComando = "\"" + CCompiler.getPath() + "\" \""+ arquivoAluno +"\" 2> errorMsg -o \""+home.convertToBar()+"/temp/"+nomeAluno+"\""
				break
			case "CPP":
				linhaDeComando = "\"" + CPPCompiler.getPath() + "\" \""+ arquivoAluno +"\" 2> errorMsg -o \""+home.convertToBar()+"/temp/"+nomeAluno+"\""
				break
			default:
				comentar_p("Enviou arquivo " + obtemExtensao)
				return false
		}

		compilar = new textfile(home + "\\temp\\compilar.bat")
		compilar.create(linhaDeComando)
		ExecAndWait(home + "\\temp\\compilar.bat")

		obtemExecutavel = new file(home + "\\temp\\" + nomeAluno + ".exe")
		obtemMensagemErro = new textfile(home + "\\temp\\errorMsg")

		if (obtemMensagemErro.getSize() != 0){
			this.obterMensagemCompilador()
			codigoFonteAutor.setTabVisibility(1, 1)
		} else {
			codigoFonteAutor.setTabVisibility(1, 0)
		}

		if (obtemExecutavel.exists()){
			obterComentarioAutomatico = definirTestes.testar(obtemExecutavel, etiquetaAtribuida.value)
		} else {
			obterComentarioAutomatico = "Erro de compilação"
		}

		alert('Operação terminada!' + lineBreak + "Aluno: " + obtemExecutavel.baseName() + lineBreak + lineBreak + obterComentarioAutomatico)

		comentar_p(obterComentarioAutomatico)

		filaDeAlunos.rows[this.obtemIndiceTabela()].className = "verified"
		filaDeAlunos.rows[this.obtemIndiceTabela()].cells[3].innerText = obterComentarioAutomatico
	}

}