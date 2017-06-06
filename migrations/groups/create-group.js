import Bluebird from 'bluebird';

import { model as Group } from '../../website/server/models/group';
import { model as User } from '../../website/server/models/user';

// @TODO: this should probably be a GroupManager library method
async function createGroup (name, privacy, type, leaderId) {
    let user = await User.findById(leaderId);
    
    let group = new Group({
        name,
        privacy,
        type,
    });

    group.leader = user._id;
    user.guilds.push(group._id);

    return Bluebird.all([group.save(), user.save()]);
};

module.exports = async function groupCreator () {
    let name = process.argv[2];
    let privacy = process.argv[3];
    let type = process.argv[4];
    let leaderId  = process.argv[5];

    let result = await createGroup(name, privacy, type, leaderId)
};



