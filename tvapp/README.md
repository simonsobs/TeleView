# React front-end for TeleView Data Portal

This directory contains the files for creating viewable webpages and URL views to 
provide a Graphical User Interface for viewing telescope data.

## Frameworks and Paradigms

JavaScript has nothing to do with Java; it is a completely different language. JavaSript was a name chosen to 
make a marketing connection to the popular Java language.

### 1. Use of the `app` directory paradigm for the NEXT.js project.

### 2. Use of the `TypeScript` language.

TypeScript is a way of writing javascript that requires strict typing of variables.
It can make a project hard to set up, but it makes adding complex features
more reliable and easier to maintain. 

React is a JavaScript library for building user interfaces.
Developers can trigger changes to the user interface by changing 
the state various of the application. This is the *react*ive component.
React allows you to write in pure TypeScript/Javascript, but it also
allows you to write in TSX/JSX, which is a combination of HTML and JavaScript.
Most of the code in this project is written in TSX format as denoted by the
`.tsx` file extension.

React has moved away from class-based components to functional components,
with `hooks`. Hooks allow you to make use of state and other features
of React without having to write a class. In the tvapp, all components
have the same general layout: 

a. States and hooks at the top of the function body

b. Logic, analysis, and calculations in the middle of the function body.

c. Layout of the component with TSX/HTML at the bottom of the function body
at the `return` statement. Note that TSX/HTML elements will have a `className`
attribute instead of a `class` attribute. This is because `class` is a reserved
word in TypeScript.

NEXT.js is a React framework. This framework extends React to allow for
more features and complex configiration. The main benefit to using NEXT.js
for this project is that it allows for server-side rendering (SSR) 
of the webpages. This means that the webpages can be rendered on the server.
While this has many uses, we use this feature to query the MongoDB server
without the need for a REST API. This is because the NEXT.js server
can query the MongoDB server directly, but only in the SSR components.

Server-side query and rendering allow for a major speedup in the loading of webpages that
are generated on a remote mountain in Chile. Here we skip the step of loading
the webpages on the client's computer, then going back to the server to query
the database. Instead, we query the database on the server, then send the
rendered webpage and data to the client.



### 3. Configurations for `Tailwind CSS` were selected.


## Intentions and Scope

The tvapp is a NEXT.js web application; a part of the TeleView project.
The Teleview project has been designed to run in Docker containers.
This was chosen to simplify the installation, deployment, and maintenance 
of the TeleView project.

While it is possible to run tvapp outside of Docker, on a local machine,
it is not the design **intention** of the TeleView project. This application
depends on a connection to the Teleview's MongoDB server. To eliminate
docker, simple take all the systems networked be docker and run then
on the host machine. However, it is recommended to use Docker so as 
not to burden developers with manually setting up ports,
bringing multiple services up and down, installing dependencies, or
distributing shared variables and files.

The **scope** of this README.md is to provide instructions for running
the development environment for the tvapp. The development environment
runs locally on the host machine, outside of Docker. However,
this environment uses the MongoDB server that is expected to be running
in a docker container.

# The Development Environment

## Starting the MongoDB server

[!WARNING]
> The Teleview sevices may allready be running. If so, you can skip this section.
> This is because the deployed TeleView project runs in Docker containers
> that have a restart-policy: *always*. This means that the TeleView services will
> be running if the images are built when Docker starts. If you are not sure
> if the TeleView services are running, you can run the command
> ```docker ps```, which will list all running containers.
> Windows and Mac users can also use the Docker Desktop GUI. 

The MongoDB server is expected to be running in a docker container, although
there is no reason why it cannot be running on the host machine directly.

To run MongoDB for TeleView follow the instructions in the README.md file
at the root of the TeleView project. In short, this is a single command

```docker compose up --build```

This requires that you have the tvapp, tvapi, and MongoDB services setup
and stable. While you may not be looking at the dockerized tvapp,
it will need to be stable for the other docker services to start correctly
using the `docker compose` command.

If you need to bring the MongoDB server down, you can use the command

```docker compose down -v```

If you have made any changes to the teleview repository, then you may
not be able to run the MongoDB server with the `--build` option.
In this case, you can run the command

```docker compose up```

This brings up that last known stable version of the MongoDB server,
(and other services) without rebuilding the docker images.

[!NOTE]
> The MongoDB server is expected to be found on port 27017 on the host machine.
> This port is configurable in TeleView, but the default port used by TeleView
> is the default port for MongoDB.
 
[!NOTE]
> You can view the MongoDB server using the Compass GUI for MongoDB.
> https://www.mongodb.com/products/tools/compass


## Installation outside of Docker

### What was used to initalize the NEXT.js tvapp?

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
At the time installation, all the default options were selected:

1. Use of the `app` directory paradigm for the NEXT.js project.
2. Use of the `TypeScript` language.
3. Configurations for `Tailwind CSS` were selected.

### Getting Started

With Node.js installed, you can use the `npm` command.

Make sure you are in the `Teleview/tvapp/` directory, the same directory that contains 
this README.md file.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

