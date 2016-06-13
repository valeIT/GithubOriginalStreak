function inject() {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    let totalContributions = 0
    let longestStreak = 0
    let evaluatingStreak = 0
    let stop = 0
    let nonContributingDays = 0
    let currentStreak = 0
    let hasNoCurrentStreak = 0
    let streakFromTo = ""
    let innerStreak = ""
    let firstCommitDate = 0
    let lastCommitDate = 0
    let longestStreakStartingDate = 0
    let longestStreakEndingDate = 0

    changeColor()
    
    if (!!document.getElementById("contributions-calendar")) {
        let couple = document.getElementById("contributions-calendar").previousElementSibling.childNodes
        if (couple.length === 1) {
            couple[0].textContent = "Contributions"
        } else {
            couple[2].textContent = "Contributions"
        }

        const days = ([].slice.call(document.getElementsByClassName("day"))).reverse()
        days.forEach((day) => {
            let todayValue = !!+day.attributes["data-count"].value
            if (todayValue) {
                totalContributions += +day.attributes["data-count"].value
                firstCommitDate = new Date(day.attributes["data-date"].value)
            }
            if (todayValue && !lastCommitDate) {
                lastCommitDate = new Date(day.attributes["data-date"].value)
            }
            if (todayValue && !stop) {
                ++currentStreak
            } else {
                ++nonContributingDays
                if (stop === 0) {
                    const start = new Date(day.attributes["data-date"].value)
                    const end = new Date()
                    const dayF = start.getUTCDate() + 1
                    const monthF = monthNames[start.getMonth()]
                    const dayT = end.getUTCDate()
                    const monthT = monthNames[end.getMonth()]
                    streakFromTo = `${dayF} ${monthF} - ${dayT} ${monthT}`
                    stop = 1
                    innerStreak = streakFromTo
                }
            }
            if (!currentStreak && nonContributingDays > 1 && todayValue && !hasNoCurrentStreak) {
                const lastCommit = new Date(day.attributes["data-date"].value)
                const diff = Math.abs((new Date()).getTime() - lastCommit.getTime())
                let unit = "days"
                let timeDiff = Math.ceil(diff / (1000 * 3600 * 24))
                if (timeDiff === 1) {
                    unit = "day"
                }
                if (timeDiff > 30) {
                    unit = "month"
                    if (timeDiff > 60) {
                        unit = "months"
                    }
                    timeDiff = (new Date()).getMonth() - lastCommit.getMonth() + (12 * ((new Date()).getFullYear() - lastCommit.getFullYear()))
                }
                hasNoCurrentStreak = `Last contributed <time>${timeDiff} ${unit} ago</time>`
            }
            if (todayValue) {
                ++evaluatingStreak
            } else {
                evaluatingStreak = 0
            }
            if (evaluatingStreak > longestStreak) {
                longestStreak = evaluatingStreak
                longestStreakStartingDate = new Date(day.attributes["data-date"].value)
                longestStreakEndingDate = new Date(day.attributes["data-date"].value)
                longestStreakEndingDate.setDate(longestStreakEndingDate.getDate() + longestStreak - 1)
            }
        })

        if (firstCommitDate) {
            const monthFrom = monthNames[firstCommitDate.getMonth()]
            const dayFrom = firstCommitDate.getUTCDate()
            const yearFrom = firstCommitDate.getFullYear()
            const monthTo = monthNames[lastCommitDate.getMonth()]
            const dayTo = lastCommitDate.getUTCDate()
            const yearTo = lastCommitDate.getFullYear()
            let currentStreakSkeleton = ""
            if (hasNoCurrentStreak) {
                currentStreakSkeleton = `<span class="text-muted">${hasNoCurrentStreak}</span>`
            } else {
                currentStreakSkeleton = `<span class="text-muted">${innerStreak}</span>`
            }
            const totalSkeleton = `<span class="text-muted">${monthFrom} ${dayFrom} ${yearFrom} - ${monthTo} ${dayTo} ${yearTo}</span>`
            const skeleton = `<div class="contrib-column contrib-column-first table-column">
                    <span class="text-muted">Contributions in the last year</span>
                    <span class="contrib-number">${totalContributions} total</span>
                    ${totalSkeleton}
                </div>
                <div class="contrib-column table-column">
                    <span class="text-muted">Longest streak</span>
                    <span class="contrib-number">${longestStreak} days</span>
                    <span class="text-muted">
                    ${monthNames[longestStreakStartingDate.getMonth()]} ${longestStreakStartingDate.getUTCDate()} –
                    ${monthNames[longestStreakEndingDate.getMonth()]} ${longestStreakEndingDate.getUTCDate()}
                    </span>
                </div>
                <div class="contrib-column table-column">
                    <span class="text-muted">Current streak</span>
                    <span class="contrib-number">${currentStreak} days</span>
                    ${currentStreakSkeleton}
                </div>`
            let range = document.createRange()
            range.selectNode(document.getElementById("contributions-calendar"))
            let documentFragment = range.createContextualFragment(skeleton)
            document.getElementById("contributions-calendar").appendChild(documentFragment)
        }
    }
}

function attachClickInjecter() {
    let pixelBar = document.getElementById("js-pjax-loader-bar")
    const config = { attributes: true, childList: true, characterData: true, attributeOldValue: true };
    ([].slice.call(document.getElementsByClassName("tabnav-tab")).forEach((tab) => {
        tab.addEventListener('click', () => { //on "Repo" click the event is deattached
            var observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.oldValue && mutation.oldValue.indexOf("is-loading") > 0 ) {
                        inject()
                        attachClickInjecter()
                        observer.disconnect()
                    }
                })
            })
            observer.observe(pixelBar, config)
        }, false)
    }))
}

function changeColor() {
    const color = localStorage.getItem("blueSky")
    if(color) {
        document.querySelectorAll("rect[fill='#eeeeee']").forEach((node)=>{node.style.fill = "#eeeeee"})
        document.querySelectorAll("rect[fill='#d6e685']").forEach((node)=>{node.style.fill = "#9DC1F6"})
        document.querySelectorAll("rect[fill='#8cc665']").forEach((node)=>{node.style.fill = "#629DF3"})
        document.querySelectorAll("rect[fill='#44a340']").forEach((node)=>{node.style.fill = "#2B7BF2"})
        document.querySelectorAll("rect[fill='#1e6823']").forEach((node)=>{node.style.fill = "#0363F0"})

        document.querySelectorAll("li[style='background-color: #eeeeee']").forEach((node)=>{node.style.backgroundColor = "#eeeeee"})
        document.querySelectorAll("li[style='background-color: #d6e685']").forEach((node)=>{node.style.backgroundColor = "#9DC1F6"})
        document.querySelectorAll("li[style='background-color: #8cc665']").forEach((node)=>{node.style.backgroundColor = "#629DF3"})
        document.querySelectorAll("li[style='background-color: #44a340']").forEach((node)=>{node.style.backgroundColor = "#2B7BF2"})
        document.querySelectorAll("li[style='background-color: #1e6823']").forEach((node)=>{node.style.backgroundColor = "#0363F0"})
    }
}

(function() {
    inject()
    attachClickInjecter()
})();