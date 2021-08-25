class A {
	constructor() {
		this.hoge = 'hoge'
		console.log(`A>>init ${this.hoge}`)
	}
}


class B extends A {
	constructor() {
		super()
		this.hoge = 'hoge2'
		console.log(`B>>init ${this.hoge}`)
	}
}

new A()
console.log("-------")
new B()
console.log("-------")
