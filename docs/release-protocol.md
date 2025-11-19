## Step 0

- [ ] Make a copy of the release [guide](https://docs.google.com/document/d/1kEP_WVg-Gnwl5GyVwtp8QNAED3DOJycBseWdoZG6PuQ/edit?tab=t.0) in the softropicblessed@gmail.com account
- [ ] Name the copy like so clientName_v_x.x.x

## Step 1: Pre-release Checklist

- [ ] package.json has the right versions. (i.e its version has been bumped up)
- [ ] Ensure the app version returned by Main.gs has the right version (It should match that of the package.json file)
- [ ] Remote client branch and local client branch are in sync
- [ ] Remote main branch and local main branch are in sync
- [ ] Ensure you are on the client/bechem branch
- [ ] Deploy GAS to client's production environment
- [ ] Refresh browser and deploy app to client's production server.
- [ ] Copy GAS app server's endpoint URL (verify its health output)
- [ ] update the .env file with the endpoint URL
- [ ] Push client branch to github

## Step 2: Tag client branch

- [ ] Go to [github actions](https://github.com/tenjohokwen/fma-skeckit-app/actions)
- [ ] select "create tag" in the left panel under Actions
- [ ] In the main panel, click on the "Run workflow" drop down
- [ ] Fill in the values... Use workflow from: <main>, Branch to tag: <bechem>, Tag name (e.g., client/bechem-1.0.0): <client/bechem-1.0.0> //NB this version MUST match that of package.json, Tag message (optional): <whatever>

## Step 3: Release

- [ ] When tag succeeds then click on actions and in the left panel under Actions, click "Build Client Desktop Packages (Manual)"
- [ ] In the main panel, click on the "Run workflow" drop down
- [ ] Fill in the values... Use workflow from: <main>, client to build: <bechem>, client version: <version>

## Step 4: Update local branch

- [ ] Go to local client branch and pull
