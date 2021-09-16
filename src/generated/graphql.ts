import { GraphQLResolveInfo } from 'graphql';
import { AppContext } from '../context';
export type Maybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type BookRoomInput = {
  guest: GuestInput;
  roomNumber: Scalars['String'];
};

export type BookRoomResult = {
  __typename?: 'BookRoomResult';
  code: Scalars['String'];
  keycard?: Maybe<Scalars['Int']>;
  message: Scalars['String'];
  success: Scalars['Boolean'];
};

export type BookRoomsByFloorInput = {
  floor: Scalars['Int'];
  guest: GuestInput;
};

export type BookRoomsByFloorResult = {
  __typename?: 'BookRoomsByFloorResult';
  bookedRooms?: Maybe<Array<Room>>;
  code: Scalars['String'];
  keycards?: Maybe<Scalars['String']>;
  message: Scalars['String'];
  success: Scalars['Boolean'];
};

export type CheckoutRoomInput = {
  guestName: Scalars['String'];
  keycard: Scalars['Int'];
};

export type CheckoutRoomsByFloorInput = {
  floor: Scalars['Int'];
};

export type CreateHotelInput = {
  floor: Scalars['Int'];
  roomPerFloor: Scalars['Int'];
};

export type Guest = {
  __typename?: 'Guest';
  age: Scalars['Int'];
  name: Scalars['String'];
};

export type GuestInput = {
  age: Scalars['Int'];
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  bookRoom: BookRoomResult;
  bookRoomsByFloor: BookRoomsByFloorResult;
  checkoutRoom: MutationResult;
  checkoutRoomsByFloor: MutationResult;
  createHotel: MutationResult;
};


export type MutationBookRoomArgs = {
  input: BookRoomInput;
};


export type MutationBookRoomsByFloorArgs = {
  input: BookRoomsByFloorInput;
};


export type MutationCheckoutRoomArgs = {
  input: CheckoutRoomInput;
};


export type MutationCheckoutRoomsByFloorArgs = {
  input: CheckoutRoomsByFloorInput;
};


export type MutationCreateHotelArgs = {
  input: CreateHotelInput;
};

export type MutationResult = {
  __typename?: 'MutationResult';
  code: Scalars['String'];
  message: Scalars['String'];
  success: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  getGuestInRoom?: Maybe<Scalars['String']>;
  listAvailableRooms: Array<Room>;
  listGuests: Scalars['String'];
  listGuestsNameByAge: Scalars['String'];
  listGuestsNameByFloor: Scalars['String'];
};


export type QueryGetGuestInRoomArgs = {
  roomNumber: Scalars['String'];
};


export type QueryListGuestsNameByAgeArgs = {
  guestAge: Scalars['Int'];
  operation: Scalars['String'];
};


export type QueryListGuestsNameByFloorArgs = {
  floor: Scalars['Int'];
};

export type Room = {
  __typename?: 'Room';
  floor: Scalars['Int'];
  guest?: Maybe<Guest>;
  keycard?: Maybe<Scalars['Int']>;
  roomNumber: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  BookRoomInput: BookRoomInput;
  BookRoomResult: ResolverTypeWrapper<BookRoomResult>;
  BookRoomsByFloorInput: BookRoomsByFloorInput;
  BookRoomsByFloorResult: ResolverTypeWrapper<BookRoomsByFloorResult>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CheckoutRoomInput: CheckoutRoomInput;
  CheckoutRoomsByFloorInput: CheckoutRoomsByFloorInput;
  CreateHotelInput: CreateHotelInput;
  Guest: ResolverTypeWrapper<Guest>;
  GuestInput: GuestInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  MutationResult: ResolverTypeWrapper<MutationResult>;
  Query: ResolverTypeWrapper<{}>;
  Room: ResolverTypeWrapper<Room>;
  String: ResolverTypeWrapper<Scalars['String']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  BookRoomInput: BookRoomInput;
  BookRoomResult: BookRoomResult;
  BookRoomsByFloorInput: BookRoomsByFloorInput;
  BookRoomsByFloorResult: BookRoomsByFloorResult;
  Boolean: Scalars['Boolean'];
  CheckoutRoomInput: CheckoutRoomInput;
  CheckoutRoomsByFloorInput: CheckoutRoomsByFloorInput;
  CreateHotelInput: CreateHotelInput;
  Guest: Guest;
  GuestInput: GuestInput;
  Int: Scalars['Int'];
  Mutation: {};
  MutationResult: MutationResult;
  Query: {};
  Room: Room;
  String: Scalars['String'];
};

export type BookRoomResultResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['BookRoomResult'] = ResolversParentTypes['BookRoomResult']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keycard?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BookRoomsByFloorResultResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['BookRoomsByFloorResult'] = ResolversParentTypes['BookRoomsByFloorResult']> = {
  bookedRooms?: Resolver<Maybe<Array<ResolversTypes['Room']>>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keycards?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GuestResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Guest'] = ResolversParentTypes['Guest']> = {
  age?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  bookRoom?: Resolver<ResolversTypes['BookRoomResult'], ParentType, ContextType, RequireFields<MutationBookRoomArgs, 'input'>>;
  bookRoomsByFloor?: Resolver<ResolversTypes['BookRoomsByFloorResult'], ParentType, ContextType, RequireFields<MutationBookRoomsByFloorArgs, 'input'>>;
  checkoutRoom?: Resolver<ResolversTypes['MutationResult'], ParentType, ContextType, RequireFields<MutationCheckoutRoomArgs, 'input'>>;
  checkoutRoomsByFloor?: Resolver<ResolversTypes['MutationResult'], ParentType, ContextType, RequireFields<MutationCheckoutRoomsByFloorArgs, 'input'>>;
  createHotel?: Resolver<ResolversTypes['MutationResult'], ParentType, ContextType, RequireFields<MutationCreateHotelArgs, 'input'>>;
};

export type MutationResultResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['MutationResult'] = ResolversParentTypes['MutationResult']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getGuestInRoom?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryGetGuestInRoomArgs, 'roomNumber'>>;
  listAvailableRooms?: Resolver<Array<ResolversTypes['Room']>, ParentType, ContextType>;
  listGuests?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  listGuestsNameByAge?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryListGuestsNameByAgeArgs, 'guestAge' | 'operation'>>;
  listGuestsNameByFloor?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryListGuestsNameByFloorArgs, 'floor'>>;
};

export type RoomResolvers<ContextType = AppContext, ParentType extends ResolversParentTypes['Room'] = ResolversParentTypes['Room']> = {
  floor?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  guest?: Resolver<Maybe<ResolversTypes['Guest']>, ParentType, ContextType>;
  keycard?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  roomNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = AppContext> = {
  BookRoomResult?: BookRoomResultResolvers<ContextType>;
  BookRoomsByFloorResult?: BookRoomsByFloorResultResolvers<ContextType>;
  Guest?: GuestResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MutationResult?: MutationResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Room?: RoomResolvers<ContextType>;
};

