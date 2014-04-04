// test data
var data1 = {
    name: 'NeedTest1',
    contact_phone: '+33622573561',
    mobile: '+3358375521',
    email: 'yanshuo.huang@utt.fr',
    description: 'Description NeedTest1',
    quantity: 10,
    classification: '5336b94ac1bde7b41d90377b',
    source_actor_type: '5336b94ac1bde7b41d90377a',
    target_actor_type: '5336b94ac1bde7b41d90377a',
};

var data2 = {
    name: 'NeedTest2',
    contact_phone: '+33622573561',
    mobile: '+3358375521',
    email: 'yanshuo.huang@utt.fr',
    description: 'Description NeedTest2',
    quantity: 10,
    classification: '5336b94ac1bde7b41d90377b',
    source_actor_type: '5336b94ac1bde7b41d90377a',
    target_actor_type: '5336b94ac1bde7b41d90377a',
};


var data3 = {
    name: 'NeedTest3',
    contact_phone: '+33622573561',
    mobile: '+3358375521',
    email: 'yanshuo.huang@utt.fr',
    description: 'Description NeedTest3',
    quantity: 10,
    classification: '5336b94ac1bde7b41d90377b',
    source_actor_type: '5336b94ac1bde7b41d90377a',
    target_actor_type: '5336b94ac1bde7b41d90377a',
};


var test1 = {};

test1 = new NeedModel(data1);
test1.save();

test1 = new NeedModel(data2);
test1.save();

test1 = new NeedModel(data3);
test1.save();

var n = new NeedModel({
    name: 'Je cherche un plateforme de gestion de crise',
    contact_phone: '+33622573561',
    mobile: '+3358375521',
    email: 'yanshuo.huang@utt.fr',
    description: 'Je cherche un plateforme de gestion de crise, qui peut matcher automatiquement des offres et des besoins',
    quantity: 10,
    classification: '5336b94ac1bde7b41d90377b',
    source_actor_type: '5336b94ac1bde7b41d90377a',
    target_actor_type: '5336b94ac1bde7b41d90377a',
});

n.creatAndSave();