# TeleView
A Web Portal for viewing Simons Observatory level-3 data

The TeleView projects is a multi-language repository and an assemblage of applications.
Each application exists in a directory withing the root TeleView folder.
Most applications can be run independently in a standalone mode for debugging and testing;
however, the applications are designed to run and be built together using Docker's compose.yaml files located in the
content root.

This README.md describes deployment of all applications with Docker compose.
For information on testing or operating and individual applications, see the README.md file in that 
application's directory.

## TeleView Components Technologies Stack
![TeleView components and relationships](static/TeleViewTechnologyStack.png "TeleView Stack")