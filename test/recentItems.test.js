const RecentItems = require('../src/recentItems');
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const rmdir = require('rmdir');
const sinon = require('sinon');

const TESTING_PATH = path.join(__dirname, 'recents');

function addProjectsToList(recentList, size) {
    switch (size) {
        case 6:
            recentList.addProject('f', 'g');
        case 5:
            recentList.addProject('e', 'f');
        case 4:
            recentList.addProject('d', 'e');
        case 3:
            recentList.addProject('c', 'd');
        case 2:
            recentList.addProject('b', 'c');
        case 1:
            recentList.addProject('a', 'b');
    }
}

describe('RecentItems', () => {
    let recentItems = new RecentItems(TESTING_PATH);

    beforeEach(() => {
        if (fs.existsSync(TESTING_PATH)) {
            fs.rmdirSync(TESTING_PATH);
        }
        fs.mkdirSync(TESTING_PATH);
        recentItems = new RecentItems(TESTING_PATH);

    });

    afterEach((done) => {
        rmdir(TESTING_PATH, {}, () => done())
    });

    it('should start with an empty list', () => {
        expect(recentItems.list.length).to.be.equals(0);
    });

    it('should add projects to list', () => {
        addProjectsToList(recentItems, 2);
        expect(recentItems.list.length).to.be.equals(2);
    })

    it('should load projects on create', () => {
        addProjectsToList(recentItems, 2);
        const secondInstance = new RecentItems(TESTING_PATH);
        expect(recentItems.list.length).to.be.equals(2);
    })

    it('should not add the same project twice', () => {
        addProjectsToList(recentItems, 2);
        expect(recentItems.list.length).to.be.equals(2);
        recentItems.addProject('a', 'b');
        expect(recentItems.list.length).to.be.equals(2);
    })

    it('should be orderer by project added time', () => {
        let clock = sinon.useFakeTimers();
        try {
            recentItems.addProject('first', '1');

            clock.tick(200);
            recentItems.addProject('second', '2');

            clock.tick(200);
            recentItems.addProject('third', '3');
            expect(recentItems.list[0].projectPath).to.be.equals('third');

            clock.tick(200);
            recentItems.addProject('first', '1');
            expect(recentItems.list[0].projectPath).to.be.equals('first');
        } finally {
            clock.restore();
        }


    })

    it('should not add more projects than limit', () => {
        recentItems.listSize = 3;
        addProjectsToList(recentItems, 6);
        addProjectsToList(recentItems, 3)
    })
});