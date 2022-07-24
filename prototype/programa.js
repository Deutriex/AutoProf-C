var programa = {
	compilacaoEmAndamento: false,

	inicia: function(){
		programa.excluirArquivosTemporarios()
		programa.calcularAlturasDinamicas()
	},

	fecha: function(){
	},		

	excluirArquivosTemporarios: function(){
		SetCurrentDirectory(home)
		ExecAndWait(home + "\\ccleaner.bat")
	},

	calcularAlturasDinamicas: function(){
		painelEsquerdo = {
			id: "submissionsPanel",
			top: 60,
			bottom: 40
		},
/*		
		arqEntrada = {
			id: "inFileCnt",
			top: 60,
			bottom: 40
		},
*/
		
		painelDireito = {
			id: "sourceCodePanel",
			top: 60,
			bottom: 90
		},

		painelEsquerdoArqES = {
			id: "testListPanel",
			top: 60,
			bottom: 40
		},

		painelDireitoArqES = {
			id: "IOFilesViewPanel",
			top: 60,
			bottom: 40,
			applytoinherited: true
		}


		dynamicHeightParameters.push(painelEsquerdo)
		dynamicHeightParameters.push(painelDireito)
		dynamicHeightParameters.push(painelEsquerdoArqES)
		dynamicHeightParameters.push(painelDireitoArqES)
		//dynamicHeightParameters.push(arqEntrada)

		programa.calculateDynamicHeights()
	},
	
	calculateDynamicHeights_apply: function(parentObj, paramObj){
		if (!parentObj) return

		calculateDynamicHeights_reCall = function(childUBound){
			if (childUBound < 0) return

			calculateDynamicHeights_reCall(childUBound-1)
			programa.calculateDynamicHeights_apply(parentObj.children[childUBound], paramObj)
		}	

		//try {
			parentObj.style.top = paramObj.top + "px"
			parentObj.style.height = document.documentElement.offsetHeight - paramObj.top - paramObj.bottom + "px"

			if (paramObj.applytoinherited === true){
				calculateDynamicHeights_reCall(parentObj.children.length-1)
			}
		/*
		} catch (err){
		}
		*/
	},

	calculateDynamicHeights: function(){
		//alert(programa.calculateDynamicHeights_apply)
	
		for (css3 = 0; css3 < dynamicHeightParameters.length; css3++){
		/*
			document.getElementById(dynamicHeightParameters[css3].id).style.top = dynamicHeightParameters[css3].top + "px"
			document.getElementById(dynamicHeightParameters[css3].id).style.height = document.documentElement.offsetHeight - dynamicHeightParameters[css3].top - dynamicHeightParameters[css3].bottom + "px"
		*/
			programa.calculateDynamicHeights_apply(document.getElementById(dynamicHeightParameters[css3].id), dynamicHeightParameters[css3])
		}
	},

	interfaceSubmissoes: {

		carregarSubmissoes: function(){

			ExecAndWait("getPauseMsg.bat")

			var comenEtiqueta = ""
			alunosMem = []
			trabalhosSubmitidos = []
			$("#progInterface").show()
			carregarPerfil = new connection(arquivoPerfil.value)

			diretorioSubmissoes = new folder(carregarPerfil.getAttribute('Submissoes'))
			diretorioTestes = new folder(carregarPerfil.getAttribute('Testes'))
			colunaExercicio = carregarPerfil.getAttribute('Coluna')

			if (carregarPerfil.getAttribute('Parcial') == "Sim") correcaoParcial = true

			programa.interfaceArqES.carregaArquivosTeste()

			listaDeAlunos.clearAll()

			trabalhosSubmetidos = diretorioSubmissoes.fileList()
			arqNomeReparados = 0

			for (arq = 0; arq < trabalhosSubmetidos.length; arq++){
				arqAtual = trabalhosSubmetidos[arq].getPath()
				arqAtualFormatado = arqAtual.formataNome(true)
	
				if (arqAtual != arqAtualFormatado){
					arqProblematico = new file(arqAtual)
					arqProblematico.rename(arqAtualFormatado)
					trabalhosSubmetidos[arq] = new textfile(arqProblematico.getPath())
					arqNomeReparados++
				}

			}

			if (arqNomeReparados){
				alert(arqNomeReparados + " arquivos foram reparados")
			}


			for (i = 3; i <= 97; i++){

				planilhaResultado.selectCell("B", i)
				nomeDoAluno = planilhaResultado.getActiveCellContent()
				var obtemAluno = new codigoFonte(i)
				alunosMem.push(obtemAluno)
				obtemExtensao = obtemAluno.extensao()
		
				marcacoes = []
				foiCorrigido = obtemAluno.foiVerificado()
	
				if (foiCorrigido){

					marcacoes.push("verified")
					comenEtiqueta = obtemAluno.comentario()

				} else if (!obtemAluno.ECodigoFonte() && obtemAluno.extensao() != ""){

					marcacoes.push("verified")
					comenEtiqueta = "Enviou arquivo com extensão" + obtemAluno.extensao()
					obtemAluno.comentar(comenEtiqueta)

				} else if (foiCorrigido === undefined){
					marcacoes.push("strike")
				} else {
					comenEtiqueta = obtemAluno.etiquetas()
				}


				detectaNome = obtemAluno.retornaNomeDetectado()
				novoAluno = filaDeAlunos.insertRow()

				alunoNome = novoAluno.insertCell()
				alunoNome.innerText = nomeDoAluno.toNameCase()


				if (detectaNome && obtemAluno.extensao() != ""){
					nomeDetectado = novoAluno.insertCell()
					nomeDetectado.innerText = detectaNome

					extensaoArq = novoAluno.insertCell()
					extensaoArq.innerText = obtemExtensao

					comentaEtiqueta = novoAluno.insertCell()

					if (obtemAluno.comentario() != APCNotFound){
						comentaEtiqueta.innerText = comenEtiqueta
						novoAluno.className = marcacoes.join(' ')
					} else {
						comentaEtiqueta.innerText = obtemAluno.etiquetas()
					}

					novoAluno.onclick = new Function("if (this.className.indexOf('selected') == -1){listaDeAlunos.selectLine("+(i-3)+"); new codigoFonteAtual().mostrar(); programa.interfaceArqES.defConfiguracoesArqES()}")

					comentaEtiqueta.ondblclick = function(){
						obtemLinha = this

						while (obtemLinha.tagName != "TR" && obtemLinha.tagName != "BODY"){
							obtemLinha = obtemLinha.parentElement
						}

						if (obtemLinha.tagName != "BODY"){
							startCorrectingComment(this, escape(this.innerText))
						}
					}


				} else {
					novoAluno.className = "naoEnviado"
					naoEnviado = novoAluno.insertCell()
					naoEnviado.colSpan = 3

					if (correcaoParcial){
						naoEnviado.innerText = "Aguardando envio..."
					} else {

						if (!obtemAluno.comentario() || obtemAluno.comentario() == APCNotFound){
							naoEnviado.innerText = APCNotFound
							obtemAluno.comentar(APCNotFound)
						} else {
							naoEnviado.innerText = "Erro no seu programa!"
						}
			
					}
				}

			}



			programa.interfaceSubmissoes.filtroAlunos.obtemEstatisticas()

		},

		listaAlunos: {
		},

		navegarLista: function(){
			var linhaAtual = listaDeAlunos.getSelectedLine()

			if (linhaAtual == -1 || (event.keyCode != 38 && event.keyCode != 40) || !event.shiftKey) return false

			if ((event.keyCode == 38 && linhaAtual > 0) || (event.keyCode == 40 && linhaAtual < filaDeAlunos.rows.length-1)){
				linhaAtualGUI = document.getElementById('filaDeAlunos').rows[linhaAtual]

				do {
					if (event.keyCode == 38) linhaAtual--
					else if (event.keyCode == 40) linhaAtual++
					linhaAtualGUI = document.getElementById('filaDeAlunos').rows[linhaAtual]

				} while ((linhaAtualGUI.style.display != "inline" && linhaAtualGUI.style.display != "") || linhaAtualGUI.className == "naoEnviado")
			}
			filaDeAlunos.rows[linhaAtual].click()
	
		},

		filtroAlunos: {

			mostraOcultaTestes: function(){
				getObj = event.srcElement

				while (getObj.tagName != "TR"){
					getObj = getObj.parentElement
				}

				cur = getObj.rowIndex+1

				for (cur = getObj.rowIndex+1; listaTestes.rows[cur].cells[0].className == "subtestes"; cur++){
					$(listaTestes.rows[cur]).toggle()

					if (listaTestes.rows[cur].style.display == "block"){
						getObj.className = "testes_e"
					} else {
						getObj.className = "testes_c"
					}
				}
			},

			obtemEstatisticas: function(){
				var naoEnviados = 0
				var naoVerificados = 0
				var verificados = 0
				if (barraDeStatus){
					var setActiveTab = barraDeStatus.getActiveTab()
				} else {
					var setACtiveTab = 0
				}

				for (i = 0; i < filaDeAlunos.rows.length; i++){
					if (filaDeAlunos.rows[i].className.indexOf('naoEnviado') != -1) naoEnviados++
					else {
						if (filaDeAlunos.rows[i].className.indexOf('verified') != -1) verificados++
						else naoVerificados++
					}
				}

				tabContents = ['Todos', (verificados + naoVerificados) + ' Enviaram', verificados + ' Verificados', naoVerificados + ' Pendentes']

				if (correcaoParcial){
					tabContents.push(naoEnviados + ' Ainda não enviaram')
				} else {
					tabContents.push(naoEnviados + ' Não enviaram')
				}

				barraDeStatus = new tabset(tabContents, document.getElementById('barraStatus'), "activeTab_u")
				barraDeStatus.attachCalls("programa.interfaceSubmissoes.filtroAlunos.filtraSubmissoes()")
				barraDeStatus.setInstancePointer(barraDeStatus)
				//barraDeStatus.setActiveTab(setActiveTab)

				if (verificados == 0){
					barraDeStatus.setTabVisibility(1, 0)
					barraDeStatus.setTabVisibility(2, 0)
				}

				if (naoVerificados == 0){
					barraDeStatus.setTabVisibility(1, 0)
					barraDeStatus.setTabVisibility(3, 0)
				}

				if (naoEnviados == 0) barraDeStatus.setTabVisibility(4, 0)

			},



			filtraNomeAlunoOuStatus: function(pos){

				var getBy = searchCrit_text.innerText.trim()

				var meth2num = []
				meth2num['Nome do aluno'] = 0
				meth2num['Comentário'] = 3

				if (getBy != "Conteúdo"){
					if (meth2num[getBy] >= filaDeAlunos.rows[pos].cells.length) return false

					nomeAtual = "[a-z ]*" + document.getElementById('nomeAlunoBusca').value.fullReplace(' ',"[a-z ]*") + "[a-z ]*"
					nomeAtualRegex = new RegExp(nomeAtual,"im")

					if (nomeAtualRegex.test(filaDeAlunos.rows[pos].cells[meth2num[getBy]].innerText)){ //filaDeAlunos.rows[pos].cells[meth2num[getBy]].innerText.toUpperCase().indexOf(document.getElementById('nomeAlunoBusca').value.toUpperCase()) != -1
						return true
					} 

					return false
					
				} else {
					try {
						padraoRegex = new RegExp(document.getElementById('nomeAlunoBusca').value,"im")
						document.getElementById('nomeAlunoBusca').style.backgroundColor = "#FFFFFF"

						if (padraoRegex.test(alunosMem[pos].obterCodigoFonte())) return true
						return false
					} catch (err){

						document.getElementById('nomeAlunoBusca').style.backgroundColor = "#FFDDCC"
						return false
					}
				}

				return false

			},

			mostrarSubmissoes: function(codClass, pos){
				if (!pos) return undefined

				if (filaDeAlunos.rows[pos].className.indexOf(codClass) != -1) return true
				if (codClass == "!" && filaDeAlunos.rows[pos].className.trim() == "") return true
				if (codClass.charAt(0) == "!" && filaDeAlunos.rows[pos].className.indexOf(codClass.substring(1, codClass.length)) == -1) return true
				if (!codClass) return true

				return false
			},

			filtraSubmissoes: function(){
				listaDeAlunos.linhasVisiveis = []
				getBy = searchCrit_text.innerText.trim()
				abaAtiva = barraDeStatus.getActiveTab()
				tagsSubmissoes = ["","!naoEnviado","verified","!","naoEnviado"]	
				codigoClasse = tagsSubmissoes[abaAtiva]


				for (i = 0; i < filaDeAlunos.rows.length; i++){

					if (programa.interfaceSubmissoes.filtroAlunos.filtraNomeAlunoOuStatus(i) && programa.interfaceSubmissoes.filtroAlunos.mostrarSubmissoes(codigoClasse,i)){
	
						$(filaDeAlunos.rows[i]).show()
						listaDeAlunos.linhasVisiveis.push(i)

					} else $(filaDeAlunos.rows[i]).hide()
				}

				if (getBy == "Conteúdo" && nomeAlunoBusca.value.trim() != "" && listaDeAlunos.linhasVisiveis.length > 1){
					$("#flagPlagiarism").show()
				} else {
					$("#flagPlagiarism").hide()
				}

			},


			denunciarPlagio: function(){
				var listaPlagiadores = []
	
				for (iii = 0; iii < listaDeAlunos.linhasVisiveis.length; iii++){
					jjj = listaDeAlunos.linhasVisiveis[iii]
					listaPlagiadores.push(filaDeAlunos.rows[jjj].cells[0].innerText)			
				}

				for (iii = 0; iii < listaDeAlunos.linhasVisiveis.length; iii++){
					jjj = listaDeAlunos.linhasVisiveis[iii]
					alunoVisivelAtual = alunosMem[jjj]
					filaDeAlunos.rows[jjj].cells[3].innerText = "Plágio (" + listaPlagiadores.joinExcept(iii) + ")"
					alunoVisivelAtual.comentar(filaDeAlunos.rows[jjj].cells[3].innerText)
					filaDeAlunos.rows[jjj].className = "verified"
				}

				programa.interfaceSubmissoes.filtroAlunos.obtemEstatisticas()
			}

		}


	},

	interfaceArqES: {

		carregaArquivosTeste: function(){
			definirTestes = new arquivosTeste(diretorioTestes.getPath().convertToSlashes())
			arqTestes = definirTestes.obtemArquivosEntrada()
			arqSaidas = definirTestes.obtemArquivosSaida()

			isNumericOutput = true

			for (h = 0; h < arqSaidas.length && isNumericOutput; h++){
				if (arqSaidas[h].passThru() != arqSaidas[h].passThru().numericOutput()){
					isNumericOutput = false
				}
			}

			arqTestes.downcast("getPath()")
			listaDeTestes.clearAll()

			var testeAnterior
	
			for (h = 0; h < arqTestes.length; h++){

				if (!definirTestes.dividedTests()){

					novoTeste = listaTestes.insertRow()
					novoTeste.onclick = new Function("programa.interfaceArqES.carregarArquivosES("+h+"); listaDeTestes.selectLine("+h+");")
					novoTeste_cnt = novoTeste.insertCell()
					novoTeste_cnt.innerText = "Teste " + (h+1)

				} else {

					obtemTeste = parseInt(arqTestes[h].getSubstring('/','last-1').numericChars())
					obtemSubteste = parseInt(arqTestes[h].getSubstring('/','last').numericChars())
					if (isNaN(obtemSubteste)) obtemSubteste = 1

					if (obtemTeste != testeAnterior){
						novoTeste = listaTestes.insertRow()
						novoTeste.onclick = function(){
							mostraOcultaTestes()
						}
						novoTeste_cnt = novoTeste.insertCell()
						novoTeste_cnt.className = "testes_c"
						novoTeste_cnt.innerText = "Teste " + obtemTeste		
					}

					novoSubteste = listaTestes.insertRow()
					$(novoSubteste).hide()
					novoSubteste_cnt = novoSubteste.insertCell()
					novoSubteste_cnt.className = "subtestes"
					novoSubteste_cnt.innerText = "Subteste " + obtemSubteste
					novoSubteste.onclick = new Function("programa.interfaceArqES.carregarArquivosES("+h+"); listaDeTestes.selectLine("+(h+obtemTeste+1)+");")

					testeAnterior = obtemTeste
	
				}
			}
		},

		carregarArquivosES: function(idx){
			arqEntrada = definirTestes.obtemArquivosEntrada()
			arqSaida = definirTestes.obtemArquivosSaida()
			arqSaidaAluno = new folder(home + "\\TEMP\\userOutput").fileList()

			taArqEntrada = inFileCnt.getElementsByTagName("TEXTAREA")[0]
			taArqSaida = outFileCntRef.getElementsByTagName("TEXTAREA")[0]
			taArqSaidaAluno = outFileCntStd.getElementsByTagName("TEXTAREA")[0]


			if (isNumericOutput){
				 taArqEntrada.value = arqSaida[idx].passThru().numericOutput().trim()
			} else {
				taArqEntrada.value = arqEntrada[idx].passThru().fixLineBreak()
			}

			if (isNumericOutput){
				taArqSaida.value = arqSaida[idx].passThru().numericOutput().trim()
			} else {
				taArqSaida.value = arqSaida[idx].passThru().fixLineBreak()
			}

			obtemArquivoAluno = new textfile(home + "\\TEMP\\userOutput\\arqSaida" + (idx+1))


			if (obtemArquivoAluno.exists() && obtemArquivoAluno.getSize() > 0){
				taArqSaidaAluno.value = obtemArquivoAluno.passThru().fixLineBreak()

			} else {
				taArqSaidaAluno.value = ""
			}

			if (isNumericOutput) taArqSaidaAluno.value = taArqSaidaAluno.value.numericOutput().trim()

		},

		destacaSaidasComErro: function(){

			arqSaida = definirTestes.obtemArquivosSaida()
			arqSaidaAluno = new folder(home + "\\TEMP\\userOutput").fileList()
			resultadoTeste = definirTestes.obtemResultadoTeste()

			programa.interfaceArqES.defConfiguracoesArqES(1)

			var lineDesloc = 0
			//alert(resultadoTeste)

			for (fi = 0; fi < arqSaida.length; fi++){
				if (listaTestes.rows[fi+lineDesloc].cells[0].className.indexOf("testes") != -1){
					lineDesloc++
				}

				if (resultadoTeste[fi] == 1) {
					listaTestes.rows[fi+lineDesloc].className = listaTestes.rows[fi+lineDesloc].className.fullReplace('failed','')
				} else {
					if (listaTestes.rows[fi+lineDesloc].className.indexOf('failed') == -1){
						listaTestes.rows[fi+lineDesloc].className += " failed"
					}
				}
			}

			programa.interfaceArqES.carregarArquivosES(1)
	
		},

		defConfiguracoesArqES: function(mde){
			modos = ["none","inline"]

			mde = mde || 0
	
			for (h = 2; h < document.getElementById('compCnt').getElementsByTagName("TABLE")[0].rows[0].cells.length; h++){
				compCnt.getElementsByTagName("TABLE")[0].rows[0].cells[h].style.display = modos[mde]
			}
		},


		showHideInOutfiles: function(tIndex){
			if (tIndex === undefined) return false

			tabRef = ["inFileCnt","outFileCntRef","outFileCntStd"]
			transCase = ["none","inline"]
			inOutFlayout = []

			inOutTaLayoutSch = new Array([1,0,0],[0,1,0],[0,0,1],[0,1,1],[1,1,1])

			for (fg = 0; fg < tabRef.length; fg++){
				document.getElementById(tabRef[fg]).style.display = transCase[inOutTaLayoutSch[tIndex][fg]]
			}

		},

		setSubmissionsView: function(mde){

			if (mde != 2) $(submissionsContainer.rows[0].cells[0]).show()
			else $(submissionsContainer.rows[0].cells[0]).hide()

			if (mde != 1) $(submissionsContainer.rows[0].cells[1]).show()
			else $(submissionsContainer.rows[0].cells[1]).hide()
		}
	}
}