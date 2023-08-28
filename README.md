# TeleView
A Web Portal for viewing Simons Observatory data

The TeleView projects is a multi-language repository that is designed to operate four applications:

1. A Django Website that provides an interface to database actions written in Python
2. A MongoDB database that provides indexing and query capacities for a Host computers data file system(s).
3. A Next.js-React (JavaScript) front-end that provides a graphical user interface for viewing data.
4. An NGINX web server that provides a reverse proxy to the Django and Next.js-React applications as well as serving 
the static data files on the host computer.


Each application exists in a directory within the root TeleView folder.
Most applications can be run independently in a standalone mode for debugging and testing;
however, the applications are designed to run and be built together using Docker's compose.yaml files located in the
content root.

## Scope of this README.md

This README.md describes deployment of all applications together with Docker compose.
For information on testing or operating and individual applications, see the README.md file in that 
application's directory.

## TeleView Components Technologies Stack
![TeleView components and relationships](static/TeleViewTechnologyStack.png "TeleView Stack")

## Why name it TeleView?

**TeleView** stands for **Tele**scope data **View**er.
In choosing this name I wanted a name that I
could easily type thousands of times, a name that was descriptive, and name that was memorable for people
that only use the application occasionally.
This is why the application sounds like "television";
This was amusing to me, and I made the favicon a black circle with yellow letters "tv" to give
the impression of a monochromatic cathode-ray tube.

# Initial Setup

TeleView is designed to work on any computer that is running Docker.
It will properly disturb my users, but this application was developed on a Windows 10 machine,
using Docker Desktop for Windows, and the Windows Subsystem for Linux (WSL2).
TeleView gets test on a Mac and is deployed on a Linux server.
It should work on any computer that is running Docker.

## Environment Variables

TeleView uses environment variables to configure the applications.
These are found in a .env file in the root directly of this project.

> [!WARNING]
> The .env file is not included in the git repository and is ignored by git.
> This is because the .env file contains sensitive information.

### Initial Setup
Copy the .env-default file (in the root of the TeleView repository)
to .env and edit the values to match your system.

The tvapp requires a special file named .env.production. See the 
/tvapp/.env.production.example to see what this file should look like.
Use the convince script init.sh to automatically copy the relevant
variables from the root .env file to the tvapp/.env.production file.

### Pointing to data
The most important environment points to the data.
```
- TELEVIEW_PLATFORMS_DATA_DIR=/data_path/to_one_or_more_telescopes/
```
Edit this value in the .env file.

> [!TIP]
> This can be an absolute or relative path on the Host computer.

This is a directory that should contain one or more folders meant to represent
physically separated systems (different telescopes).

Each telescope folder should contain a folder named `smurf` that contains the data files.
In the future, it is our intention expanded to include other data types with diniated by
different folder names. For now, the only folder that is used is `smurf`. 
If the data directory is missing or empty, the application will not identify that directory as a *platform*
and any datafiles will not be indexed/available in the database.

> [!TIP]
> **platform** is an important term in TeleView, and indicates an
> indexed data attribute used for filtering and returning data.

![img.png](static/PlatformDirStructure.png)
Caption: The directory structure. In the image example above, `TELEVIEW_PLATFORMS_DATA_DIR=/so/level2-daq/` While this directory has
multiple subdirectories, only the **lat** and **satp1** directories are indexed as a platforms. The other directories
are either missing the expected data directory (only *smurf* is allowed at the time of writing) or their
smurf directory is empty, as is the case for **satp2** in this example.

## Docker, a few tips
Helping install Docker is beyond the scope of this README.md. Here is the link, https://docs.docker.com/engine/install/,
it is a little different in every operating system.

If you are going to work on this or any project that uses Docker, you may want to configure
your system to start docker when the system starts. 

> [!WARNING] 
> TeleView is set to start when Docker starts, it has the container `restart-policy` set to "always".
> This is the desired behavior for a production system, but it can be annoying when developing.

> [!TIP]
> If you are developing this application, remember to clear the cache periodically so as not to
> overload your disk storage.
> `docker system prune --force --all` is a good command to know when
> starting your Docker journey.

> [!TIP]
> It is the docker server that is required to be running. Most of the time that
> my docker commands fail it is because I forgot to start the docker server. 
> To see if the docker-server is running,
> open a terminal and type `docker version`, you should see both **Client** and **Server** version information.

> [!Warning]
> For running scripts with docker commands. In Linux all docker commands need a `sudo` prefix,
> in macOS and Windows, using `sudo` is a mistake for docker. If you are running my TeleView scripts
> that contain docker commands, you will need to run the script with `sudo` if you are a Linux user.
> If you are on the site computer, you will not be able to run the scripts as general `sudo` usage is restricted.
