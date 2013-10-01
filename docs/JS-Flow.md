# Javascript Flow for HabitRPG

# Notes on Hierarchy:
## src/models
### user.js  
Defines:  

- *UserSchema* 
    - id
        - type: string (default 'helpers.uuid')
    - apiToken  
        - type: string (default 'helpers.uuid')
    - _v (mongoose object)  
        - type: number (default 0)
    - achievements  
        - originalUser
        - helpedHabit
        - ultimateGear
        - beastMaster
        - streak
    - auth  
        - Facebook
        - local
            - email
            - hashed_password
            - salt
            - username
        - time stamps
            - created
            - loggedin
    - backer
    
    - balance  
    - habitIds    
    - dailysIds  
    - todoIds  
    - rewardIds  
    - filters  
    
    - flags  
    - history  
    - invitations 
    
    - items
        - armor  
        - weapon  
        - head  
        - shield
        - currentPet  
        - eggs  
        - hatchingPotions  
        - lastDrop  
        - pets  
    - lastCron  
    - party  
    - preferences  
    - profile  
    - stats  
    - tags  
    - tasks
        - history: {date, value}  
        - id  
        - notes  
        - tags { "4ddf03d9-54bd-41a3-b011-ca1f1d2e9371" : true }  
        - text  
        - type  
        - up  
        - down  
        - value  
        - completed  
        - priority: '!!'  
        - repeat {m: true, t: true}  
        - streak  
    
    - strict (true)




Functions:  
- transformTaskLists  
- toJSON  
- post(init)    
-pre(save)  

Calls  
- Mongoose  

### group.js  
defines:  
- GroupSchema

functions:  
- removeDuplicates  
- pre(save)  
- toJSON  

Calls:  
- Mongoose

## src/controllers

### auth.js

calls:  
- api.auth  
- api.registerUser  
- api.loginLocal  
- api.loginFacebook  
- api.resetPassword  
- api.changePassword  
- api.setupPassport (notice PassPORT not Password)  

### groups.js
may need to refer to routes.coffee

functions:  
- removeSelf  
- sendInvite

Calls:  
- api.getGroups  
- api.getGroup (singular)  
- api.createGroup  
- api.updateGroup  
- api.attachGroup  
- api.postChat  
- api.deleteChatMessage  
- api.join  
- api.leave  
- api.invite  

### user.js
may need to refer to routes.coffee

Calls:  
- api.marketBuy  
- api.verifyTaskExists  
- api.scoreTask  
- api.getTasks  
- api.getTask  
- api.deleteTask  
- api.updateTask  
- api.updateTasks  
- api.createTask  
- api.sortTask  
- api.clearCompleted  
- api.buy  
- api.getUser  
- api.updateUser  
- api.cron  
- api.revive  
- api.reroll  
- api.reset  
- api.buyGems  
- api.deleteTag  
- api.batchUpdate  

functions:  
- taskSanitizeAndDefaults  
- addTask  
- updateTask  
- deleteTask  

## src/routes
this whole section may need to be referenced later
### api.js
/api/v1

maybe use existing docs on api

### auth.js

## src/


