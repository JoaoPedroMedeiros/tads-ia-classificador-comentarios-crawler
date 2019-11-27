const Crawler = require('crawler')
const CommentsPaginationService = require('./comments-pagination-service')

const extractTextFromCommentElement = (commentElement) => {
    var text = commentElement.children[0].children[0].data
    if (commentElement.children.length > 1) {
        text += commentElement.children[1].children[0].data
    }
    return text
}

const extractRatingFromEvaluationElement = (evaluationElement) => {
    const clasz = evaluationElement.attribs.class
    return Number(clasz.replace(new RegExp('.*bubble_(\\d)\\d'), '$1'))
}

const clearAdditionalEvaluations = (elements) => {
    const okElements = { length: 0, find: elements.find }
    for (let i = 0; i < elements.length; i++) {
        const evaluationElement = elements[i]
        if (evaluationElement.parent.next.type !== 'text') {
            okElements[String(okElements.length)] = evaluationElement   
            okElements.length += 1
        }
    }
    return okElements
}

const extractCommentFromResponse = (response) => {
    const $ = response.$
    const commentAndEvaluationElements = $('.hotels-community-tab-common-Card__card--ihfZB.hotels-community-tab-common-Card__section--4r93H')
    const evaluationElements = clearAdditionalEvaluations(commentAndEvaluationElements.find('.ui_bubble_rating'))
    const commentsElements = commentAndEvaluationElements.find('.hotels-review-list-parts-ExpandableReview__reviewText--3oMkH')
    if (evaluationElements.length !== commentsElements.length) {
        throw new Error(`LINK_AQUI Ops, não consegui identificar corretamente os comentários e avaliações. Os tamanhos de array são diferentes :/`)
    }
    const comments = []
    for (let i = 0; i < commentsElements.length; i++) {
        const commentElement = commentsElements[i]
        const evaluationElement = evaluationElements[i]
        comments.push({
            text: extractTextFromCommentElement(commentElement),
            evaluation: extractRatingFromEvaluationElement(evaluationElement)
        })
    }
    return comments
}

const crawlCommentsForLinks = async (links, { forEachComment }) => new Promise(async (resolve, reject) => {
    const paginatedUris = await CommentsPaginationService.generatePaginatedURIs(links)
    const commentsSummary = {
        total_erros: 0,
        total_comentarios: 0,
    }
    const crawler = new Crawler({
        maxConnections: 1,
        callback: (error, response, done) => {
            if (error) {
                commentsSummary.total_erros += 1
                console.log(commentsSummary)
                console.error(error)
                done()
            } else {
                try {
                    const comments = extractCommentFromResponse(response)
                    
                    Promise.all(comments.map(comment => forEachComment(response.options.uri, comment)))
                        .then(() => {
                            commentsSummary.total_comentarios += comments.length
                            console.log(commentsSummary)
                            done()
                        })
                        .catch(e => {
                            commentsSummary.total_erros += 1
                            console.log(commentsSummary)
                            console.error(e)
                            done()
                        })
                } catch (e) {
                    commentsSummary.total_erros += 1
                    console.log(commentsSummary)
                    console.error(e)
                    done()
                }
            }
            
        }
    })

    crawler.on('drain', () => {
        resolve(commentsSummary)
    })

    crawler.queue(paginatedUris)
})

module.exports = {
    crawlCommentsForLinks,
}