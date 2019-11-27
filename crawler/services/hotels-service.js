const Crawler = require('crawler')

const elementsToArray = (elements) =>
    Object.keys(elements).map((key) => elements[key])

const crawlHotelLinks = () => new Promise((resolve, reject) => {
    const crawler = new Crawler({
        maxConnections: 10,
        callback: (error, res, done) => {
            if (error) {
                done()
                reject(error)
            } else {
                const refs = []
                const $ = res.$
                const titles = $('.property_title.prominent')
                for (let i = 0; i < titles.length; i++) {
                    const hotel = titles[i];
                    refs.push(hotel.attribs.href)
                }
                done()
                resolve(refs)
            }
            
        }
    })
    crawler.queue('https://www.tripadvisor.com.br/Hotels-g303631-oa240-Sao_Paulo_State_of_Sao_Paulo-Hotels.html')
})

module.exports = {
    crawlHotelLinks,
}