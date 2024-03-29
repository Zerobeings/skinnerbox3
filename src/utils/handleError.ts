'use strict';

interface ErrorObject {
  originalError?: {
    message: string;
  };
  message: string;
}

const handleError = (message: string): string => {
/***************************************************************************
 *
 * adopted from https://github.com/tandrewnichols/extract-json-from-string
 *
 ***************************************************************************/

  const extractjson = (str: string): ErrorObject[] => {
    const jsonify = (almostJson: string): any => {
      try {
        return JSON.parse(almostJson);
      } catch (e) {
        almostJson = almostJson.replace(/([a-zA-Z0-9_$]+\s*):/g, '"$1":').replace(/'([^']+?)'([\s,\]\}])/g, '"$1"$2');
        return JSON.parse(almostJson);
      }
    };

    const chars: { [key: string]: string } = {
      '[': ']',
      '{': '}'
    };

    const any = <T>(iteree: T[], iterator: (item: T, index: number, array: T[]) => boolean): boolean => {
      let result: boolean = false;
      for (let i = 0; i < iteree.length; i++) {
        result = iterator(iteree[i], i, iteree);
        if (result) {
          break;
        }
      }
      return result;
    };

    const extract = (str: string): string | null => {
      let startIndex = str.search(/[\{\[]/);
      if (startIndex === -1) {
        return null;
      }

      let openingChar = str[startIndex];
      let closingChar = chars[openingChar];
      let endIndex = -1;
      let count = 0;

      str = str.substring(startIndex);
      any(str.split(''), (letter, i) => {
        if (letter === openingChar) {
          count++;
        } else if (letter === closingChar) {
          count--;
        }

        if (!count) {
          endIndex = i;
          return true;
        }
        return false;
      });

      if (endIndex === -1) {
        return null;
      }

      let obj = str.substring(0, endIndex + 1);
      return obj;
    };

    let result: string | null;
    const objects: ErrorObject[] = [];
    while ((result = extract(str)) !== null) {
      try {
        let obj = jsonify(result);
        objects.push(obj);
      } catch (e) {
        // Do nothing
      }
      str = str.replace(result, '');
    }

    return objects;
  };

  const Errors: { [key: string]: string } = {
    '1': 'require(!config.permanent, "1");  // The contract was made permanent and no updates can be made.',
    '2': 'require(!config.permanent, "2");  // The contract was made permanent and no updates can be made.',
    '3': 'require(!withdrawer.permanent, "3");  // The withdrawer has been fixed permanently.',
    '4': 'require(_msgSender() == owner() || _msgSender() == withdrawer.account, "4");  // Only the owner or the withdrawer can call the withdraw() function.',
    '5': 'require(sent1, "5");  // error while withdrawing funds',
    '6': 'require(sent2, "6");  // error while withdrawing funds',
    '7': 'require(verify(auth, _msgSender()), "7"); // Invalid merkle proof for the invite list.',
    '8': 'require(i.price * _count == msg.value, "8");  // Incorrect ETH amount.',
    '9': 'require(i.start <= block.timestamp, "9"); // The mint has not started yet for this invite.',
    '10': 'require(minted[_msgSender()][auth.key] + _count <= i.limit, "10"); // Mint limit reached.',
    '11': 'require(n+_count-1 <= config.supply, "11");  // Cannot mint above total supply',
    '12': 'require(_count > 0, "12"); // Can gift at least one or more',
    '13': 'require(n+_count-1 <= config.supply, "13");  // Cannot givt above total supply',
    '14': 'require(_isApprovedOrOwner(_msgSender(), _tokenId), "14"); // You do not have the authority to burn the token',
    '15': 'require(tokenId > 0 && tokenId <= config.supply, "15"); // Token ID does not exist.',
    '16': 'require(!config.permanent, "16");  // The contract was made permanent and no updates can be made.'
  };

  let errorObjects = extractjson(message);
  if (errorObjects.length > 0) {
    let error = errorObjects[0];
    if (error.originalError) {
      let match = /execution reverted: (.+)$/.exec(error.originalError.message);
      if (match && match.length > 0) {
        let code = match[1];
        let errorMessage = `ERROR ${code}: ${Errors[code].split('//')[2].trim()}`;
        error.message = errorMessage;
      }
    }
    return error.message;
  } else {
    return `${Errors[Number(message)].split('//')[1].trim()}`;
  }
};

export default handleError;
