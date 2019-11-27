const HotelsService = require('./services/hotels-service')
const CommentsService = require('./services/comments-service')
const CommentRepository = require('./repositories/comments-repository')

let totalComentarios = 0

const persistComment = async (uri, comment) => {
    console.log(`Comentário registrado. Avaliação [${comment.evaluation}], URI: ${uri}`)
    return CommentRepository.insert({
        uri,
        description: comment.text,
        evaluation: comment.evaluation
    })
}

const crawlEverythingYouCan = async () => {
    const links = await HotelsService.crawlHotelLinks()
    const results = await CommentsService.crawlCommentsForLinks(links, {
        forEachComment: persistComment
    })
    console.log('RESULTADO FINAL =====> ')
    console.log(results)
}

crawlEverythingYouCan()
    .then(console.log)
    .catch(console.error)
