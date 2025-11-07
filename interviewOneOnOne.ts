import { read } from "fs";

function fetchPromisified(url: any) {
    return new Promise((resolve, reject) =>{
        fetch(url)
        .then(response => {
            if (!response.ok) {
                reject(() => console.log("error"))
            } else {
                return response.json()
            }
        })
        .then(data => resolve(data))
        .catch(err => reject(err))
    });
}

fetchPromisified(url).then(data => {
    console.log("fetch data")
}).catch(error => {
    console.error("error", error.message)
})


function greet(name: string, callback: () => void) {
    console.log("greet function"+name)
    callback()
}

function saygoodby() {
    console.log("bye!")
}

greet("vasanth", saygoodby)


function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

delay(2000).then(() => console.log("waited 2 seconds"))



function fetchDataPromisified() {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve("data received"), 1000);
    })
}

fetchDataPromisified().then(())


function readfile(callback) {
    setTimeout(() => callback(null, "file content"), 1000)
}

function readFilePromisified() {
    return new Promise((resolve, reject) => {
        readfile((err, data) => {
            if (err) reject(err);
            else resolve(data)
        });
    });
}

function getUser() {
    return new Promise((resolve) => {
        setTimeout(() => resolve({id: 1, name: "vasanth"}), 1000)
    })
}

function getPosts(userId) {
    return new Promise((resolve)=> {
        setTimeout(()=> resolve(["Post1", "Post2"]), 1000)
    })
}

getUser()
.then((user) => getPosts(user.id))
.then((posts) => console.log("user posts:",posts))
.catch(console.error)


function downloadFilePRomised(url) {
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            if (url.startswith("http")) resolve("File download")
            else reject("Invalid URL");
        }, 1000)
    })
}

downloadFilePRomised(jkdfgkjfg)
.then(() => console.log("Succes"))
.catch(() => console.log(err));



function readFilePRomisified() {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}

readFilePRomisified()
.then(console.log)
.catch(console.error)


function promisify(fn)