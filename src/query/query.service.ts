import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { numberRegex } from 'src/utils/models/common.model';
import { TPopulate, TQuery } from 'src/utils/models/query.model';
import * as qs from 'qs';
import settings from '../settings.json';
import { toNonAccented } from 'src/utils/functions/function';

@Injectable()
export class QueryService {
  private populateMerge = (fieldSplit: any[], object: any) => {
    let exists = false;
    for (const key in fieldSplit) {
      if (fieldSplit[key]['path'] === object['path']) {
        if (object['populate']) {
          let merge: any[] = [];
          for (const item of object['populate']) {
            merge.push(item);
          }
          if (fieldSplit[key]['populate']) {
            fieldSplit[key]['populate'].push(...merge);
          } else {
            fieldSplit[key]['populate'] = merge;
          }
        }
        exists = true;
      }
    }
    if (!exists) fieldSplit = [...fieldSplit, object];
    return fieldSplit;
  };

  private handleField(fields: string) {
    let fieldHandle: any = {},
      selectObj: any,
      fieldSplit: any[] = [];

    if (fields) {
      //tách fields ra bằng dấu , để phân tích
      const fieldArr = fields.split(',').filter((item: string) => item !== '');

      for (const field of fieldArr) {
        //chạy qua từng field, nếu field có dấu . tức là đang có field muốn tham chiếu
        if (field.includes('.')) {
          const nestedFieldArr = field
            .split('.')
            .filter((item: string) => item !== '');

          //lấy value cuối cùng trong chuỗi
          let removeLastEl = nestedFieldArr.slice(0, -1).join('.');
          let lastEl = nestedFieldArr.slice(-1).join();

          //check nếu có dấu - ở đầu thì phải đưa về value chứ ko dc nằm ở key
          if (removeLastEl.startsWith('-')) {
            removeLastEl = removeLastEl.replace('-', '');
            lastEl = '-' + lastEl;
          }

          //tách thành dạng {'a.b': c}
          if (!fieldHandle[removeLastEl])
            fieldHandle = {
              ...fieldHandle,
              [removeLastEl]: lastEl,
            };
          else {
            if (
              !fieldHandle[removeLastEl].includes('*') ||
              lastEl.includes('-')
            )
              fieldHandle[removeLastEl] =
                fieldHandle[removeLastEl] + ' ' + lastEl;
          }
        }
        //nếu không có tham chiếu thì add vào select chứ ko dùng poppulate
        else
          selectObj = {
            ...selectObj,
            [field]: 1,
          };
      }

      for (let [key, value] of Object.entries(fieldHandle)) {
        const keySplit = key.split('.').filter((item: string) => item !== '');
        let populateObj: TPopulate;
        if (keySplit.length > 1) {
          populateObj = keySplit.reduceRight(
            (prev: TPopulate, cur: string, index) => {
              return {
                path: cur,
                ...(index + 1 === keySplit.length
                  ? {
                      ...((value as string).includes('-')
                        ? {
                            ...((value as string).includes('*')
                              ? {
                                  select: (value as string).replace('*', ''),
                                }
                              : {
                                  select: value as string,
                                }),
                          }
                        : {
                            ...(value !== '*' && {
                              select: value as string,
                            }),
                          }),
                    }
                  : { populate: [prev] }),
              };
            },
            { populate: {} },
          );
        } else {
          populateObj = {
            path: key,
            ...((value as string).includes('-')
              ? {
                  ...((value as string).includes('*')
                    ? {
                        select: (value as string).replace('*', ''),
                      }
                    : {
                        select: value as string,
                      }),
                }
              : {
                  ...(value !== '*' && {
                    select: value as string,
                  }),
                }),
          };
        }
        //kiểm tra path đã tồn tại trong mảng chưa, nếu rồi thì phải merge các object cùng path với nhau

        fieldSplit = this.populateMerge(fieldSplit, populateObj);
      }
      for (const field of fieldArr) {
        if (field === '*') {
          for (const key in selectObj) {
            if (!key.includes('-')) {
              delete selectObj[key];
            }
          }
          break;
        }
      }

      for (const item of fieldSplit) {
        if (item['select']?.includes('*')) delete item['select'];
      }
    }

    return {
      populate: fieldSplit,
      select: selectObj,
    };
  }

  private handleFilter(object: object) {
    let result: typeof object = {};
    //Chạy qua điều kiện của object
    for (const key in object) {
      //nếu là mảng
      if (Array.isArray(object[key])) {
        for (const condition of object[key]) {
          if (result[key]) {
            result[key] = [...result[key], this.handleFilter(condition)];
          } else {
            result = {
              [key]: [this.handleFilter(condition)],
            };
          }
        }
      } else {
        //nếu là object thì check text search để đưa về đúng trường cần tìm
        let isTextSearch = false;
        for (const field of settings.TEXT_SEARCH) {
          if (key === field) {
            for (const compareKey in object[key]) {
              result = {
                [`${field}NonAccented`]: {
                  //compare key sử dụng quy tắc của mongodb, ví dụ như $eq, $in, $regex...
                  [compareKey]: toNonAccented(object[key][compareKey]),
                },
              };
            }
            isTextSearch = true;
            break;
          }
        }
        //
        if (!isTextSearch)
          result = {
            [key]: this.stringToNumberObject(object[key]),
          };
      }
    }
    return result;
  }

  //hàm đưa giá trị cuối cùng của object về thành number nếu nó thực sự là number
  private stringToNumberObject(object: object | string) {
    if (typeof object === 'string') {
      return +object;
    }
    for (let key in object) {
      if (typeof object[key] !== 'object') {
        return {
          [key]: numberRegex.test(object[key]) ? +object[key] : object[key],
        };
      }
      return {
        [key]: this.stringToNumberObject(object[key]),
      };
    }
  }

  async handleQuery<T>(model: Model<T>, query: TQuery, _id?: any) {
    let { fields, filter, page, limit, meta, sort } = query;
    if (!page) page = 1;
    if (!limit) limit = 10;
    if (!sort) sort = '_id';
    let selectObj: any,
      populate: any[] = [],
      result: any[],
      filterObj: object = {},
      total_count: number,
      filter_count: number,
      metaSelect: string[] = [];

    if (fields) {
      populate = this.handleField(fields).populate;
      selectObj = this.handleField(fields).select;
    }

    if (filter)
      filterObj = this.handleFilter(
        qs.parse(qs.stringify(filter), { depth: 10 }),
      );

    if (meta)
      metaSelect = meta.split(',').filter((meta: string) => meta !== '');

    try {
      if (_id && typeof _id === 'string')
        result = await model.findById(_id).select(selectObj).populate(populate);
      else if (_id && Array.isArray(_id))
        result = await model
          .find({ _id: { $in: _id } })
          .select(selectObj)
          .populate(populate);
      else
        result = await model
          .find({ ...filterObj })
          .sort(sort)
          .select(selectObj)
          .populate(populate)
          .skip((+page - 1) * +limit)
          .limit(+limit)
          .lean();
      for (const meta of metaSelect) {
        if (meta === '*') {
          total_count = await model.find().countDocuments();
          filter_count = await model.find({ ...filterObj }).countDocuments();
          break;
        }
        if (meta === 'total_count') total_count = await model.countDocuments();
        if (meta === 'filter_count')
          filter_count = await model.countDocuments({ ...filterObj });
      }
    } catch (error) {
      console.log(error);
    }
    const data = {
      data: result,
    };
    for (const meta of metaSelect) {
      if (meta === '*') {
        data['meta'] = {
          total_count,
          filter_count,
        };
        break;
      }
      if (meta === 'total_count') data['meta'] = { total_count };
      if (meta === 'filter_count') data['meta'] = { filter_count };
    }
    return data;
  }
}
