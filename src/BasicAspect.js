/**
 * Created by Palash on 11/24/2016.
 */

function before(pointcut, advice){
    return function () {
        try {
            advice();
        } catch (e) {
            console.log("Exception thrown from before advice: " + e.message);
        }
        return pointcut.apply(this, arguments);
    }
}

function after(pointcut, advice){
    return function () {
        let temp = pointcut.apply(this, arguments);
        try {
            advice(temp);
        } catch (e) {
            console.log("Exception thrown from after advice: " + e.message);
            throw e;
        }
        return temp;
    }
}

class Pointcut {
    constructor(fn, context, isRegex) {
        this.fn = fn;
        this.context = context;
        this.isRegex = isRegex == true;
        this.orig = this.context[this.fn];
    }

    pointcut(){
        return this.context[this.fn];
    }

    arguments(){
        return Array.from(this.pointcut().arguments);
    }

    before(advice){
        this.insideAround = false;
        if (this.isRegex) {
            let regex = new RegExp(this.fn);
            for(let func in this.context) {
                if(regex.test(func)) {
                    this.context[func] = before(this.context[func], advice);
                }
            }
        } else {
            this.context[this.fn] = before(this.context[this.fn], advice);
        }
    }

    after(advice){
        this.insideAround = false;
        if (this.isRegex) {
            let regex = new RegExp(this.fn);
            for(let func in this.context) {
                if(regex.test(func)) {
                    this.context[func] = after(this.context[func], advice);
                }
            }
        } else {
            this.context[this.fn] = after(this.context[this.fn], advice);
        }
    }

    around(advice){
        this.insideAround = true;
        this.context[this.fn] = advice;
    }

    proceed(){
        if (this.insideAround) {
            return this.orig.apply(this, this.arguments());
        }
        throw {
            message: "Proceed can only be called from around advice."
        }
    }

}