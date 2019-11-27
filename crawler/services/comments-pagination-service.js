const Crawler = require('crawler')

const extractNumberOfPagesFromResponse = (response) => {
    const $ = response.$
    pageNumbersElement = $('.pageNumbers')[0]
    lastPageNumberElement = pageNumbersElement.children[pageNumbersElement.children.length - 1]
    return Number(lastPageNumberElement.children[0].data)
}


const crawlNumberOfPagesForEachUri = (links) => new Promise((resolve, reject) => {
    const pagesForUri = {} 
    const crawler = new Crawler({
        maxConnections: 10,
        callback: (error, res, done) => {
            if (error) {
                pagesForUri[res.options.uri] = {
                    numberOfPages: null,
                    errorStep: 'SENDING_REQUEST',
                    error: error
                }
                done()
            } else {
                try {
                    pagesForUri[res.options.uri] = {
                        numberOfPages: extractNumberOfPagesFromResponse(res)
                    }
                    done()
                } catch (e) {
                    pagesForUri[res.options.uri] = {
                        numberOfPages: null,
                        errorStep: 'PROCESS_RESPONSE',
                        error: e
                    }
                    done()
                }
            }
            
        }
    })

    crawler.on('drain', () => {
        resolve(pagesForUri)
    })

    crawler.queue(links.map((link) => `https://www.tripadvisor.com.br${link}`))
})

const generatePaginatedURIs = async (links) => {
    const pagesForUri = await crawlNumberOfPagesForEachUri(links)

    const uris = []
    Object.keys(pagesForUri).forEach(uri => {
        const pages = pagesForUri[uri]
        if (pages.numberOfPages != null) {
            for (let page = 0; page <= pages.numberOfPages; page++) {
                if (page === 0) {
                    uris.push(uri)
                } else {
                    uris.push(uri.replace(new RegExp('(.*)Reviews(.*)'), `$1Reviews-or${page * 5}$2`))
                }
            }
        } else {
            console.error(`ERROR IN ${pages.errorStep}`)
            console.error(pages.error)
        }
    })
    return uris
    
} 

module.exports = {
    generatePaginatedURIs,
}