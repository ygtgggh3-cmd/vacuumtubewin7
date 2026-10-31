const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const test = require('node:test')
const package = require('../package.json')

//the windows 7 build must never self-update: upstream releases need windows 10+
function setupLegacyUpdater() {
    const modulePath = require.resolve('../src/updater')
    delete require.cache[modulePath]

    const updater = require(modulePath)
    const handlers = new Map()
    const openedUrls = []
    const autoUpdater = new EventEmitter()
    const calls = []

    for (const name of [ 'checkForUpdates', 'checkForUpdatesAndNotify', 'downloadUpdate', 'quitAndInstall' ]) {
        autoUpdater[name] = async () => { calls.push(name); return {} }
    }

    updater.setup({
        autoUpdater,
        getWindow: () => null,
        platform: 'win32',
        env: {},
        electron: {
            app: {
                isPackaged: true,
                getPath: () => 'C:\\Users\\Test\\VacuumTube Win7\\VacuumTube Win7.exe',
                getVersion: () => package.version
            },
            ipcMain: { handle: (name, handler) => handlers.set(name, handler), on: () => {} },
            shell: { openExternal: async (url) => openedUrls.push(url) }
        }
    })

    return { updater, handlers, openedUrls, calls };
}

test('package.json flags this as the legacy build on electron 22', () => {
    assert.equal(package.vacuumtube.legacy, true)
    assert.equal(package.devDependencies.electron, '22.3.27')
    assert.equal(package.dependencies['electron-updater'], undefined)
})

test('legacy build never asks electron-updater to check, download or install', async () => {
    const { handlers, calls } = setupLegacyUpdater()
    await new Promise(setImmediate)

    const info = await handlers.get('check-for-updates')()
    assert.equal(info.status, 'unsupported')
    assert.equal(info.canAutoUpdate, false)

    assert.equal((await handlers.get('download-update')()).status, 'unsupported')
    assert.equal(handlers.get('install-update')(), false)
    assert.deepEqual(calls, [])
})

test('legacy build sends manual updates to its own releases page, not upstream', async () => {
    const { updater, handlers, openedUrls } = setupLegacyUpdater()

    assert.equal(updater.getManualDownloadUrl('win32', 'x64', 'installer'), package.vacuumtube.releasesUrl)
    assert.equal(updater.getManualDownloadUrl('win32', 'ia32', 'portable'), package.vacuumtube.releasesUrl)

    await handlers.get('open-update-download')()
    assert.deepEqual(openedUrls, [ package.vacuumtube.releasesUrl ])
    assert.ok(!openedUrls[0].includes('shy1132'))
})
