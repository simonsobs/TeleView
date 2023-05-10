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

## Pointing to data
The Django restAPI in tvapi uses an environment variable to see the parent directories that contain all the 
data that is accessible by the TeleView data portal.

This variable name is:
```
TELEVIEW_LEVEL3_DATA_DIRECTORIES
```

It is expected that this variable contains one or more full paths to parent data directories.
Each full path is expected to be separated by the semicolon character `;`.

If this variable is not available on a given system, 
then the local directory TeleView/test_data is used as the only data directory location.
