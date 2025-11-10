const allTabs = Array.from(document.querySelectorAll(".lesson-tab"));
const allLists = Array.from(document.querySelectorAll(".lesson-list"));

allLists.forEach(list => list.lessionId = list.getAttribute("lesson"));

allTabs.forEach((tab) => {
    tab.lessionId = tab.getAttribute("lesson");
    tab.addEventListener("click", () => {
        if (tab.classList.contains("active")) {
            return
        }
        allTabs.forEach(othTab => {
            if (othTab !== tab) {
                othTab.classList.remove("active")
            }
        })
        tab.classList.add("active")

        allLists.forEach(list => {
            if (list.lessionId !== tab.lessionId) {
                list.classList.remove("active")
            } else {
                list.classList.add("active")
            }
        })
    });
})

// click first tab
if (allTabs.length > 0) {
    allTabs[0].click()
}