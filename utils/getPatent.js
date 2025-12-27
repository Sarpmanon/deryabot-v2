async function getPatent(data) {
    let patent = ''
    switch(data.patent[0]) {
            case "40":
            patent = '<:40:1342981197751517214>';
            break;
            case "39":
            patent = '<:39:1342981196224925797>';
            break;
            case "38":
            patent = '<:38:1342981194710515752>';
            break;
            case "37":
            patent = '<:37:1342981321122910378>';
            break;
            case "36":
            patent = '<:36:1342981193347502123>';
            break;
            case "35":
            patent = '<:35:1342981192063910071>';
            break;
            case "34":
            patent = '<:34:1342981189832671284>';
            break;
            case "33":
            patent = '<:33:1342981188100558909>';
            break;
            case "32":
            patent = '<:32:1342981186653261956>';
            break;
            case "31":
            patent = '<:31:1342981184644448406>';
            break;
            case "30":
            patent = '<:30:1342979966786076753>';
            break;
            case "29":
            patent = '<:29:1342979964840181840>';
            break;
            case "28":
            patent = '<:28:1342979962642366464>';
            break;
            case "27":
            patent = '<:27:1342979961128222750>';
            break;
            case "26":
            patent = '<:26:1342979959542648832>';
            break;
            case "25":
            patent = '<:25:1342979958146076832>';
            break;
            case "24":
            patent = '<:24:1342979957009285130>';
            break;
            case "23":
            patent = '<:23:1342979955252007115>';
            break;
            case "22":
            patent = '<:22:1342979306883911730>';
            break;
            case "21":
            patent = '<:21:1342978853714264134>';
            break;
            case "20":
            patent = '<:20:1342964030029168660>';
            break;
            case "19":
            patent = '<:19:1342964028322091018>';
            break;
            case "18":
            patent = '<:18:1342964026304495636>';
            break;
            case "17":
            patent = '<:17:1342964024593350750>';
            break;
            case "16":
            patent = '<:16:1342964023620141116>';
            break;
            case "15":
            patent = '<:15:1342964021954875392>';
            break;
            case "14":
            patent = '<:14:1342964020570755143>';
            break;                         
            case "13":
            patent = '<:13:1342964019157401690>';
            break;
            case "12":
            patent = '<:12:1342964017869881405>';
            break;
            case "11":
            patent = '<:11:1342964016259268822>';
            break;
            case "10":
            patent = '<:10:1342963701405454438>';
            break;
            case "9":
            patent = '<:9_:1342963699845169203>';
            break;
            case "8":
            patent = '<:8_:1342963697617731739>';
            break;
            case "7":
            patent = '<:7_:1342963695331835967>';
            break;
            case "6":
            patent = '<:6_:1342963693620559892>';
            break;
            case "5":
            patent = '<:5_:1342963692035375236>';
            break;
            case "4":
            patent = '<:4_:1342963689732706305>';
            break;
            case "3":
            patent = '<:3_:1342978046290034758>';
            break;
            case "2":
            patent = '<:2_:1342963687735951432> ';
            break;
            case "1":
            patent = '<:1_:1342963686440042619>';
            break;
            case undefined:
            return;
        }

        return patent;
}

module.exports = getPatent;