module.exports = {
    client: {
        includes:['./src/**/*.tsx'],
        tagName: 'gql',
        service: {
            name:'server',
            url:'http://localhost:4000/graphql'
        }
    }
}

//apollo가 하는 일은 파일을 보면서 
//gql이라는 태그를 볼때마다 typescript definition을 제공한다
//즉 내가 작성한 것을 내가 얻는 것.