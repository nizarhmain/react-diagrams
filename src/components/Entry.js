import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import ts from 'typescript'

export default class Entry extends Component {

	constructor(props) {
		super(props)
		this.state = {
			importList: [],
			componentName: '',
			methods: []
		}

		this.initialState = this.state
	}

	onDrop(files) {
		this.setState(this.initialState)
		files.forEach(file => {
			const reader = new FileReader();
			reader.onload = () => {
				const fileAsBinaryString = reader.result;
				this.parseJavascript(fileAsBinaryString, file.name)
			}

			reader.onabort = () => console.log('file reading was aborted');
			reader.onerror = () => console.log('file reading has failed');

			reader.readAsBinaryString(file);
		})
	}


	parseJavascript(sourceCode, filename) {
		let tsSourceFile = ts.createSourceFile(
			filename,
			sourceCode,
			ts.ScriptTarget.Latest
		)
		console.log(filename, tsSourceFile.statements)
		this.loopThroughFile(tsSourceFile.statements)
		// get name of the component

	}

	loopThroughFile(sourceFile) {
		sourceFile.forEach(element => {
			this.getImports(element)
			this.getComponentName(element)
			this.getMethods(element)
		});
	}
	
	renderList(list) {
		return (
			<ul>
				{list.map((element) =>
					<h2 key={element.toString()}>
						{element}
					</h2>
				)}
			</ul>
		);
	}

	getComponentName(element) {
		if (element.hasOwnProperty('name')) {
			let componentName = element.name.escapedText
			this.setState({ componentName })
		}
	}


	getImports(element) {
		if (element.hasOwnProperty('importClause')) {
			let importToAdd = element.importClause.name.escapedText
			this.setState({ importList: [...this.state.importList, importToAdd] })
		}
	}

	getMethods(element) {
		if (element.hasOwnProperty('members')) {
			element.members.forEach(member => {
				if (member.hasOwnProperty('name')) {
					let params = this.getParameterOfMethod(member)
					let newMethodObject = {
						name: member.name.escapedText,
						params: params
					}

					this.setState({ methods: [...this.state.methods, newMethodObject] })
				}
			});
			console.log(this.state)
		}

	}

	getParameterOfMethod(method) {
		// check if it contains a NodeObject if yes, then that is the parameter
		let params = []
		method.parameters.forEach(element => {
			if(element.constructor.name === 'NodeObject') {
				params.push(element.name.escapedText)
			}
		});
		return params
	}



	render() {
		return (
			<div>
				<Dropzone className="hi" onDrop={this.onDrop.bind(this)}>
					<h1> Importa Configurazione </h1>
				</Dropzone>
				<h3>{this.state.componentName}</h3>
				{this.renderList(this.state.importList)}
			</div>
		)
	}
}
