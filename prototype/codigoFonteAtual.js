var codigoFonteAtual = function(){

	var idxAluno = listaDeAlunos.getSelectedLine()
	var alunoAtual = alunosMem[idxAluno]

/*
	alert(idxAluno)
	alert(alunoAtual.obtemIndiceTabela())
*/

	this.mostrar = function(){

		obterOCodigoFonte = alunoAtual.obterCodigoFonte()

		if (obterOCodigoFonte != ""){
			sourceCodeView.setValue(obterOCodigoFonte)
		} else {
			alert('Este arquivo é binário')
			sourceCodeView.clearAll()
		}

		etiquetaAtribuida.value = ""

		nomeAlunoAtual.value = document.getElementById('filaDeAlunos').rows[idxAluno].cells[0].innerText //alunoAtual.retornaNomePlanilha()

		codigoFonteAutor = new tabset(document.getElementsByName('sourceCodeTab'), document.getElementById('autorCodigoFonte'), "activeTab")
		codigoFonteAutor.setInstancePointer(codigoFonteAutor)

	}

	this.interromper = function(){
		ExecAndWait(program.getPath() + "\\temp\\interromperSaidaAtual.bat")
	}


	this.parar = function(){
		ExecAndWait(program.getPath() + "\\temp\\pararSaidaAtual.bat")
		programa.compilacaoEmAndamento = false
	}


	this.compilar = function(){
		programa.compilacaoEmAndamento = true
		programa.excluirArquivosTemporarios()
		$('#corrigeCodigoFonte').hide()
		$("#interromperCodigoFonte").show()
		$("#pararCodigoFonte").show()

		alunoAtual.alterarCodigoFonte(sourceCodeView.getValue())
		alunoAtual.compilar()

		programa.interfaceArqES.destacaSaidasComErro()
		document.getElementById('compCnt').getElementsByTagName("TABLE")[0].rows[0].cells[3].click()
		programa.interfaceSubmissoes.filtroAlunos.obtemEstatisticas()
		programa.interfaceSubmissoes.filtroAlunos.filtraSubmissoes()

		$("#corrigeCodigoFonte").show()
		$("#interromperCodigoFonte").hide()
		$("#pararCodigoFonte").hide()
	}
	
	this.reportar = function(){
		alunoAtual.comentar(etiquetaAtribuida.value)

		filaDeAlunos.rows[alunoAtual.obtemIndiceTabela()].className = "verified"
		filaDeAlunos.rows[alunoAtual.obtemIndiceTabela()].cells[3].innerText = etiquetaAtribuida.value
		programa.interfaceSubmissoes.filtroAlunos.obtemEstatisticas()

	}
}