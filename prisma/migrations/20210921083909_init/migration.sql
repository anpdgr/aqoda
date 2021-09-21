-- CreateTable
CREATE TABLE "keycards" (
    "number" SMALLINT NOT NULL,

    PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "rooms" (
    "number" VARCHAR NOT NULL,
    "floor" SMALLINT NOT NULL,
    "keycard" SMALLINT,
    "guestName" VARCHAR,
    "guestAge" SMALLINT,

    PRIMARY KEY ("number")
);
