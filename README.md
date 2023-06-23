Barber Admin Panel
---
## Requirements

For development, you will need Node.js (14.15.1) and MongoDB 4.4 installed in your environment.

### Node
- #### Node installation on Ubuntu

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.
    $ npm --version
    14.15.1

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g


- #### Node installation using NVM (Node Version Manager) Recommended
  You can install node.js using nvm. It not only installs the lates nodejs version but allows you to manage all its earlier versions.
	
      $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
      
      Ensure that nvm was installed correctly
      $ nvm --version
      
      Install the version of Node.js you want
      $ nvm install node
      
      Use the latest version
      $ nvm use node
      
      Install the latest LTS version with
      $ nvm install --lts
      
	  Use the latest LTS version
      $ nvm use --lts
      
	  Use a specific version
      $ nvm use 14.15.1
	
---

## Install
    $ cd /var/www/html/barber-admin-panel
    $ npm install

## Configure app

Open `/var/www/html/barber-admin-panel/.env` then edit it with your settings. You will need:

## Running the project

    $ node ./bin/www