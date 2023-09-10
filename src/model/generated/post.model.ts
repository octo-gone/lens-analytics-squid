import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import {PublicationRef} from "./publicationRef.model"

@Entity_()
export class Post {
    constructor(props?: Partial<Post>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string


    @Column_("text", {nullable: false})
    contentUri!: string
}
